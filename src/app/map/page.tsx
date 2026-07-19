'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import { regions } from '@/data/regions';

declare global {
  interface Window {
    kakao: any;
  }
}

interface Kindergarten {
  kindercode: string;
  name: string;
  establish: string;
  addr: string;
  telno: string;
  hpaddr: string;
  opertime: string;
  lat: number;
  lng: number;
  edate: string;
  rppnname: string;
  rpst_yn: string;
  clcnt3: number;
  clcnt4: number;
  clcnt5: number;
  mixclcnt: number;
  shclcnt: number;
  ppcnt3: number;
  ppcnt4: number;
  ppcnt5: number;
  mixppcnt: number;
  shppcnt: number;
  totalStudents: number;
  ag3fpcnt: number;
  ag4fpcnt: number;
  ag5fpcnt: number;
  capacity: number;
  availableSeats: number;
  hasBus: boolean;
  busCount: number;
  mealType: string;
  mealCount: number;
  hasNutritionist: boolean;
  drcnt: number;
  adcnt: number;
  gnrl_thcnt: number;
  spcn_thcnt: number;
  etc_emp_cnt: number;
  totalTeachers: number;
  totalStaff: number;
  teacherStudentRatio: number;
  hasAfterSchool: boolean;
  afterSchoolClasses: number;
  afterSchoolTime: string;
  afterSchoolStudents: number;
}

type KG = Kindergarten & { distance?: number | null };

type EstablishFilter = '전체' | '공립' | '사립';
type AgeFilter = '전체' | '3' | '4' | '5';
type SortKey = 'distance' | 'name' | 'availability' | 'ratio';

interface Filters {
  establish: EstablishFilter;
  age: AgeFilter;
  hasBus: boolean;
  hasAfterSchool: boolean;
  hasAvailability: boolean;
}

interface HomePoint {
  lat: number;
  lng: number;
  label: string;
  kind: 'gps' | 'place';
}

const PUB_COLOR = '#1c736d'; // 공립 (대비 ≥4.5:1)
const PRIV_COLOR = '#5a4cb8'; // 사립 (대비 ≥4.5:1)
const MAX_COMPARE = 3;
const PREFS_KEY = 'km_map_prefs_v1';

const DEFAULT_FILTERS: Filters = {
  establish: '전체',
  age: '전체',
  hasBus: false,
  hasAfterSchool: false,
  hasAvailability: false,
};

// 학부모 상황별 필터 조합 — 한 번 눌러 시나리오에 맞는 유치원만 강조
const PRESETS: { key: string; label: string; hint: string; patch: Partial<Filters>; sort?: SortKey }[] = [
  { key: 'dual', label: '맞벌이 추천', hint: '통학차량 + 방과후 운영', patch: { hasBus: true, hasAfterSchool: true } },
  { key: 'public-seat', label: '국공립 빈자리', hint: '국공립 중 잔여석 있는 곳', patch: { establish: '공립', hasAvailability: true }, sort: 'availability' },
  { key: 'seat', label: '바로 입학 가능', hint: '잔여석 있는 곳부터', patch: { hasAvailability: true }, sort: 'availability' },
  { key: 'ratio', label: '교사비율 좋은 곳', hint: '교사 1인당 원아 적은 순', patch: {}, sort: 'ratio' },
];

// ---------- helpers ----------
function isPublic(establish: string) {
  return establish?.includes('공립');
}

function getEstablishLabel(establish: string) {
  if (!establish) return '';
  if (establish.includes('공립(단설)')) return '공립 단설';
  if (establish.includes('공립(병설)')) return '공립 병설';
  if (establish.includes('사립(법인)')) return '사립 법인';
  if (establish.includes('사립(사인)')) return '사립 개인';
  return establish;
}

function formatPhone(tel: string) {
  if (!tel) return '';
  return tel.replace(/[^\d-]/g, '');
}

function formatMeal(raw: string) {
  if (!raw) return '';
  const map: Record<string, string> = {
    '1': '직영 급식',
    '2': '위탁 급식',
    '3': '공동 조리',
    직영: '직영 급식',
    위탁: '위탁 급식',
    공동: '공동 조리',
  };
  return map[raw] || raw;
}

function getEndTime(opertime: string) {
  if (!opertime) return '';
  const m = opertime.split('~');
  return m.length > 1 ? m[1].trim() : '';
}

function getYears(edate: string) {
  if (!edate || edate.length < 4) return 0;
  const year = Number(edate.slice(0, 4));
  if (!year) return 0;
  return Math.max(0, 2026 - year);
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function ageSeats(k: Kindergarten, age: AgeFilter) {
  if (age === '3') return Math.max(0, k.ag3fpcnt - k.ppcnt3);
  if (age === '4') return Math.max(0, k.ag4fpcnt - k.ppcnt4);
  if (age === '5') return Math.max(0, k.ag5fpcnt - k.ppcnt5);
  return k.availableSeats;
}

function capPercent(k: Kindergarten) {
  return k.capacity > 0 ? Math.min(100, Math.round((k.totalStudents / k.capacity) * 100)) : 0;
}

const SGG_TO_SIDO = new Map<string, string>();
regions.forEach((sido) => sido.sgg.forEach((s) => SGG_TO_SIDO.set(s.code, sido.code)));

// ---------- icons (line style, 통일) ----------
function IconBus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 16V6a2 2 0 012-2h12a2 2 0 012 2v10" /><path d="M3 16h18" /><path d="M5 16v2M19 16v2" /><circle cx="7.5" cy="13" r="0.6" /><circle cx="16.5" cy="13" r="0.6" /><path d="M4 9h16" />
    </svg>
  );
}
function IconClock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconSeat({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11V6a2 2 0 012-2h10a2 2 0 012 2v5" /><path d="M4 11h16v4a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M7 17v2M17 17v2" />
    </svg>
  );
}

// ---------- markers ----------
function markerSvg(isPub: boolean, state: 'base' | 'hover' | 'selected') {
  const color = isPub ? PUB_COLOR : PRIV_COLOR;
  const big = state === 'selected';
  const vb = big ? 34 : 28;
  const vbh = big ? 44 : 36;
  const r = big ? 8 : 6.5;
  const cy = big ? 17 : 14;
  const stroke = state !== 'base'
    ? `<path d="M${vb / 2} 0C${vb * 0.224} 0 0 ${vb * 0.224} 0 ${vb / 2}c0 ${vbh * 0.29} ${vb / 2} ${vbh - 14} ${vb / 2} ${vbh - 14}s${vb / 2} -${vbh - 14 - 0} ${vb / 2} -${vbh - 14}C${vb} ${vb * 0.224} ${vb * 0.776} 0 ${vb / 2} 0z" fill="none" stroke="#1b1c1f" stroke-width="1.5"/>`
    : '';
  const label = isPub ? '공' : '사';
  const path = `M${vb / 2} 0C${vb * 0.224} 0 0 ${vb * 0.224} 0 ${vb / 2}c0 ${vbh * 0.29} ${vb / 2} ${vbh - 14} ${vb / 2} ${vbh - 14}s${vb / 2} -${vbh - 14} ${vb / 2} -${vbh - 14}C${vb} ${vb * 0.224} ${vb * 0.776} 0 ${vb / 2} 0z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${vb}" height="${vbh}" viewBox="0 0 ${vb} ${vbh}"><path d="${path}" fill="${color}"/>${stroke}<circle cx="${vb / 2}" cy="${cy}" r="${r}" fill="white"/><text x="${vb / 2}" y="${cy + 3.4}" font-size="${big ? 11 : 9}" font-weight="800" text-anchor="middle" fill="${color}" font-family="sans-serif">${label}</text></svg>`;
}

function makeMarkerImage(kakao: any, isPub: boolean, state: 'base' | 'hover' | 'selected') {
  const w = state === 'selected' ? 34 : 28;
  const h = state === 'selected' ? 44 : 36;
  return new kakao.maps.MarkerImage(
    `data:image/svg+xml,${encodeURIComponent(markerSvg(isPub, state))}`,
    new kakao.maps.Size(w, h),
    { offset: new kakao.maps.Point(w / 2, h) }
  );
}

function homeMarkerImage(kakao: any) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44"><path d="M18 0C9 0 1.5 7.3 1.5 16.3 1.5 28.5 18 44 18 44s16.5-15.5 16.5-27.7C34.5 7.3 27 0 18 0z" fill="#1b1c1f"/><path d="M18 8l8 7v11h-5v-7h-6v7h-5V15z" fill="#f6c945"/></svg>`;
  return new kakao.maps.MarkerImage(
    `data:image/svg+xml,${encodeURIComponent(svg)}`,
    new kakao.maps.Size(36, 44),
    { offset: new kakao.maps.Point(18, 44) }
  );
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersByCodeRef = useRef<Map<string, any>>(new Map());
  const imageCacheRef = useRef<Record<string, any>>({});
  const homeMarkerRef = useRef<any>(null);
  const homeOverlayRef = useRef<any>(null);
  const homeCircleRef = useRef<any>(null);
  const sortTouchedRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefsLoadedRef = useRef(false);

  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSgg, setSelectedSgg] = useState('');
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<KG | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [home, setHome] = useState<HomePoint | null>(null);
  const [search, setSearch] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [showDetailDetails, setShowDetailDetails] = useState(false);
  const [compareList, setCompareList] = useState<KG[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const currentSido = regions.find((r) => r.code === selectedSido);

  // ----- toast with auto-dismiss -----
  const toast = useCallback((msg: string, persist = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSearchMsg(msg);
    if (!persist && msg) {
      toastTimerRef.current = setTimeout(() => setSearchMsg(''), 4000);
    }
  }, []);

  // ----- fetch -----
  const fetchData = useCallback(async (sidoCode: string, sggCode: string) => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/kindergarten?sidoCode=${sidoCode}&sggCode=${sggCode}`);
      const json = await res.json();
      setKindergartens(json.data || []);
    } catch (e) {
      console.error('Fetch error:', e);
      setKindergartens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----- restore prefs on mount -----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.filters) setFilters((f) => ({ ...f, ...p.filters }));
        if (p.sido) setSelectedSido(p.sido);
        if (p.sido && p.sgg) {
          setSelectedSgg(p.sgg);
          fetchData(p.sido, p.sgg);
        }
      }
    } catch {
      /* ignore */
    }
    prefsLoadedRef.current = true;
  }, [fetchData]);

  // ----- persist prefs -----
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ sido: selectedSido, sgg: selectedSgg, filters })
      );
    } catch {
      /* ignore */
    }
  }, [selectedSido, selectedSgg, filters]);

  // ----- derived -----
  const withDistance: KG[] = useMemo(
    () =>
      kindergartens.map((k) => ({
        ...k,
        distance: home ? distanceKm(home.lat, home.lng, k.lat, k.lng) : null,
      })),
    [kindergartens, home]
  );

  const filtered = useMemo(
    () =>
      withDistance.filter((k) => {
        if (filters.establish === '공립' && !isPublic(k.establish)) return false;
        if (filters.establish === '사립' && isPublic(k.establish)) return false;
        if (filters.hasBus && !k.hasBus) return false;
        if (filters.hasAfterSchool && !k.hasAfterSchool) return false;
        if (filters.hasAvailability && ageSeats(k, filters.age) <= 0) return false;
        return true;
      }),
    [withDistance, filters]
  );

  const display = useMemo(() => {
    const arr = [...filtered];
    const effSort: SortKey = sortKey === 'distance' && !home ? 'name' : sortKey;
    arr.sort((a, b) => {
      if (effSort === 'distance') return (a.distance ?? 9e9) - (b.distance ?? 9e9);
      if (effSort === 'availability') return ageSeats(b, filters.age) - ageSeats(a, filters.age);
      if (effSort === 'ratio') return (a.teacherStudentRatio || 9e9) - (b.teacherStudentRatio || 9e9);
      return a.name.localeCompare(b.name, 'ko');
    });
    return arr;
  }, [filtered, sortKey, home, filters.age]);

  // 선택 지역/필터 결과의 한줄 요약 (맵 위 오버레이용)
  const summary = useMemo(() => {
    const n = filtered.length;
    if (!n) return null;
    const pub = filtered.filter((k) => isPublic(k.establish)).length;
    const withSeat = filtered.filter((k) => ageSeats(k, filters.age) > 0).length;
    const ratios = filtered.map((k) => k.teacherStudentRatio).filter((r) => r > 0);
    const avgRatio = ratios.length
      ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 10) / 10
      : 0;
    return { n, pubPct: Math.round((pub / n) * 100), withSeat, avgRatio };
  }, [filtered, filters.age]);

  const activeFilterCount = [
    filters.establish !== '전체',
    filters.age !== '전체',
    filters.hasBus,
    filters.hasAfterSchool,
    filters.hasAvailability,
  ].filter(Boolean).length;

  // ----- map init -----
  useEffect(() => {
    if (!kakaoLoaded || !mapRef.current || mapInstanceRef.current) return;
    const kakao = window.kakao;
    mapInstanceRef.current = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
      draggable: true,
      scrollwheel: true,
    });

    // 지도 위 UI가 추가되거나 반응형 레이아웃이 바뀌어도 기본 탐색 제스처를
    // 잃지 않도록 명시적으로 활성화한다.
    mapInstanceRef.current.setDraggable(true);
    mapInstanceRef.current.setZoomable(true);
  }, [kakaoLoaded]);

  const getImage = useCallback((isPub: boolean, state: 'base' | 'hover' | 'selected') => {
    const key = `${isPub ? 'p' : 'v'}-${state}`;
    if (!imageCacheRef.current[key]) {
      imageCacheRef.current[key] = makeMarkerImage(window.kakao, isPub, state);
    }
    return imageCacheRef.current[key];
  }, []);

  const applyHighlight = useCallback(() => {
    markersByCodeRef.current.forEach((entry, code) => {
      const pub = entry.pub;
      const marker = entry.marker;
      if (selected?.kindercode === code) {
        marker.setImage(getImage(pub, 'selected'));
        marker.setZIndex(100);
      } else if (hovered === code) {
        marker.setImage(getImage(pub, 'hover'));
        marker.setZIndex(50);
      } else {
        marker.setImage(getImage(pub, 'base'));
        marker.setZIndex(1);
      }
    });
  }, [selected, hovered, getImage]);

  // ----- place markers -----
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !map) return;

    markersByCodeRef.current.forEach((e) => e.marker.setMap(null));
    markersByCodeRef.current = new Map();

    if (filtered.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();
    filtered.forEach((k) => {
      const pos = new kakao.maps.LatLng(k.lat, k.lng);
      bounds.extend(pos);
      const pub = isPublic(k.establish);
      const marker = new kakao.maps.Marker({
        map,
        position: pos,
        image: getImage(pub, 'base'),
        title: k.name,
      });
      kakao.maps.event.addListener(marker, 'click', () => {
        setSelected(k);
        setShowDetailDetails(false);
      });
      kakao.maps.event.addListener(marker, 'mouseover', () => setHovered(k.kindercode));
      kakao.maps.event.addListener(marker, 'mouseout', () => setHovered(null));
      markersByCodeRef.current.set(k.kindercode, { marker, pub });
    });

    if (home) bounds.extend(new kakao.maps.LatLng(home.lat, home.lng));
    // 여백을 줘 마커가 가장자리·오버레이(상단 요약/하단 범례)에 붙지 않게 한다.
    // 넓게 퍼진 지역은 한 단계 축소돼 숨통이 트이고, 좁은 지역은 과도 확대되지 않는다.
    map.setBounds(bounds, 72, 56, 88, 56);
    // 마커가 극단적으로 몰려 있을 때(1~2곳) 과확대로 길을 잃지 않게 하한
    if (map.getLevel() < 4) map.setLevel(4);
    applyHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, kakaoLoaded]);

  // ----- highlight on select/hover -----
  useEffect(() => {
    applyHighlight();
  }, [applyHighlight]);

  // ----- pan to selected -----
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selected) return;
    map.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
  }, [selected]);

  // ----- home marker / radius -----
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !map) return;
    if (homeMarkerRef.current) homeMarkerRef.current.setMap(null);
    if (homeOverlayRef.current) homeOverlayRef.current.setMap(null);
    if (homeCircleRef.current) homeCircleRef.current.setMap(null);
    homeMarkerRef.current = null;
    homeOverlayRef.current = null;
    homeCircleRef.current = null;
    if (!home) return;
    const pos = new kakao.maps.LatLng(home.lat, home.lng);
    const isGps = home.kind === 'gps';

    if (isGps) {
      // 현재 위치: 구글/카카오/네이버 공통의 파란 점 + 맥동(pulse) 오버레이
      const el = document.createElement('div');
      el.className = 'km-gps';
      el.innerHTML = '<span class="km-gps-pulse"></span><span class="km-gps-dot"></span>';
      homeOverlayRef.current = new kakao.maps.CustomOverlay({ map, position: pos, content: el, zIndex: 210, yAnchor: 0.5, xAnchor: 0.5 });
    } else {
      // 검색한 장소: 기준점을 나타내는 핀
      homeMarkerRef.current = new kakao.maps.Marker({ map, position: pos, image: homeMarkerImage(kakao), zIndex: 200 });
    }

    // 반경 1km 안내 링 — 도보 거리 감을 준다 (현재 위치는 파랑, 검색 장소는 노랑)
    homeCircleRef.current = new kakao.maps.Circle({
      map,
      center: pos,
      radius: 1000,
      strokeWeight: 1,
      strokeColor: isGps ? '#4285F4' : '#1b1c1f',
      strokeOpacity: isGps ? 0.5 : 0.4,
      strokeStyle: 'shortdash',
      fillColor: isGps ? '#4285F4' : '#f6c945',
      fillOpacity: isGps ? 0.06 : 0.08,
    });
  }, [home, kakaoLoaded]);

  // ----- handlers -----
  function handleSidoChange(code: string) {
    setSelectedSido(code);
    setSelectedSgg('');
    setKindergartens([]);
    setSelected(null);
  }

  function handleSggChange(code: string) {
    setSelectedSgg(code);
    if (selectedSido && code) fetchData(selectedSido, code);
  }

  const applyCoords = useCallback(
    (lat: number, lng: number, label: string, kind: 'gps' | 'place') => {
      const kakao = window.kakao;
      if (!kakao?.maps?.services) return;
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result: any[], status: any) => {
        if (status !== kakao.maps.services.Status.OK) {
          toast('위치를 확인할 수 없어요. 동네 이름으로 검색해 주세요.');
          return;
        }
        const region = result.find((r) => r.region_type === 'B') || result[0];
        const sgg = region?.code?.slice(0, 5);
        const sido = SGG_TO_SIDO.get(sgg);
        setHome({ lat, lng, label, kind });
        if (sido && sgg) {
          toast('');
          setSelectedSido(sido);
          setSelectedSgg(sgg);
          if (!sortTouchedRef.current) setSortKey('distance');
          fetchData(sido, sgg);
        } else {
          toast('아직 이 지역은 지원하지 않아요. 가까운 시/군/구를 직접 선택해 주세요.', true);
          const map = mapInstanceRef.current;
          if (map) map.setCenter(new kakao.maps.LatLng(lat, lng));
        }
      });
    },
    [fetchData, toast]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const kakao = window.kakao;
    if (!kakao?.maps?.services) {
      toast('지도를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
      return;
    }
    toast('검색 중...', true);
    const places = new kakao.maps.services.Places();
    places.keywordSearch(q, (data: any[], status: any) => {
      const valid = status === kakao.maps.services.Status.OK
        ? data.find((d) => Number(d.y) && Number(d.x))
        : null;
      if (valid) {
        applyCoords(Number(valid.y), Number(valid.x), valid.place_name || q, 'place');
        return;
      }
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(q, (res: any[], st: any) => {
        if (st === kakao.maps.services.Status.OK && res.length > 0 && Number(res[0].y)) {
          applyCoords(Number(res[0].y), Number(res[0].x), res[0].address_name || q, 'place');
        } else {
          toast('검색 결과가 없어요. 동/도로명 또는 건물명으로 검색해 보세요.');
        }
      });
    });
  }

  function handleMyLocation() {
    if (locating) return;
    if (!navigator.geolocation) {
      toast('이 브라우저에서는 위치 기능을 사용할 수 없어요. 동네 이름으로 검색해 주세요.');
      return;
    }
    setLocating(true);
    toast('현재 위치를 찾는 중...', true);

    const onOk = (pos: GeolocationPosition) => {
      setLocating(false);
      applyCoords(pos.coords.latitude, pos.coords.longitude, '현재 위치', 'gps');
    };
    const onErr = (err: GeolocationPositionError, isFallback: boolean) => {
      // code 1: 권한 거부, code 2: 위치 확인 불가, code 3: 시간 초과
      if (err.code === err.PERMISSION_DENIED) {
        setLocating(false);
        toast('위치 접근이 꺼져 있어요. 주소창의 위치 아이콘에서 허용하거나, 동네 이름으로 검색해 주세요.', true);
        return;
      }
      if (!isFallback) {
        // 고정밀 실패(실내·데스크톱 등) 시 저정밀·캐시 허용으로 한 번 더 시도
        navigator.geolocation.getCurrentPosition(onOk, (e) => onErr(e, true), {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 300000,
        });
        return;
      }
      setLocating(false);
      toast('현재 위치를 찾지 못했어요. 동네 이름이나 주소로 검색해 주세요.', true);
    };

    navigator.geolocation.getCurrentPosition(onOk, (e) => onErr(e, false), {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 60000,
    });
  }

  function selectCard(k: KG) {
    setSelected(k);
    setShowDetailDetails(false);
    const map = mapInstanceRef.current;
    if (map) map.panTo(new window.kakao.maps.LatLng(k.lat, k.lng));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function presetActive(p: (typeof PRESETS)[number]) {
    const target = { ...DEFAULT_FILTERS, age: filters.age, ...p.patch };
    return (
      filters.establish === target.establish &&
      filters.hasBus === target.hasBus &&
      filters.hasAfterSchool === target.hasAfterSchool &&
      filters.hasAvailability === target.hasAvailability &&
      (!p.sort || sortKey === p.sort)
    );
  }

  function applyPreset(p: (typeof PRESETS)[number]) {
    if (presetActive(p)) {
      resetFilters();
      return;
    }
    setFilters((f) => ({ ...DEFAULT_FILTERS, age: f.age, ...p.patch }));
    if (p.sort) {
      sortTouchedRef.current = true;
      setSortKey(p.sort);
    }
  }

  function toggleCompare(k: KG) {
    setCompareList((list) => {
      if (list.some((x) => x.kindercode === k.kindercode)) {
        return list.filter((x) => x.kindercode !== k.kindercode);
      }
      if (list.length >= MAX_COMPARE) {
        toast(`비교는 최대 ${MAX_COMPARE}곳까지 담을 수 있어요.`);
        return list;
      }
      return [...list, k];
    });
  }

  const isComparing = (code: string) => compareList.some((x) => x.kindercode === code);
  const selDist = selected && home ? distanceKm(home.lat, home.lng, selected.lat, selected.lng) : null;
  const hasRegion = !!selectedSgg;
  const activePresetKey = PRESETS.find((preset) => presetActive(preset))?.key ?? '';

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => window.kakao.maps.load(() => setKakaoLoaded(true))}
      />
      <main className="map-page">
        {/* ===== Toolbar ===== */}
        <div className="map-toolbar">
          <div className="map-toolbar-inner">
            <div className="map-toolbar-title" aria-hidden="true">
              <span>유치원 탐험 지도</span>
              <strong>동네 찾기</strong>
            </div>
            <form className="map-search" onSubmit={handleSearch} role="search">
              <svg className="map-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="text"
                className="map-search-input"
                placeholder="동네·주소·건물명 검색 (예: 역삼동)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="동네 또는 주소 검색"
              />
              <button type="submit" className="map-search-btn">검색</button>
            </form>
            <button type="button" className="map-loc-btn" onClick={handleMyLocation} disabled={locating}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
              {locating ? '찾는 중…' : '내 위치'}
            </button>
            <div className="map-selectors">
              <select className="map-select" value={selectedSido} onChange={(e) => handleSidoChange(e.target.value)} aria-label="시/도 선택">
                <option value="">시/도</option>
                {regions.map((r) => (<option key={r.code} value={r.code}>{r.name}</option>))}
              </select>
              <select className="map-select" value={selectedSgg} onChange={(e) => handleSggChange(e.target.value)} disabled={!selectedSido} aria-label="시/군/구 선택">
                <option value="">시/군/구</option>
                {currentSido?.sgg.map((s) => (<option key={s.code} value={s.code}>{s.name}</option>))}
              </select>
            </div>
            <select
              className="map-select map-sort-select"
              value={sortKey}
              onChange={(e) => { sortTouchedRef.current = true; setSortKey(e.target.value as SortKey); }}
              aria-label="정렬 기준"
            >
              <option value="distance" disabled={!home}>가까운 순{!home ? ' (위치 필요)' : ''}</option>
              <option value="name">이름순</option>
              <option value="availability">빈자리 많은 순</option>
              <option value="ratio">교사비율 좋은 순</option>
            </select>
          </div>

          <div className="map-filterbar" role="group" aria-label="필터 및 정렬">
            <span className="map-filter-label">결과 좁히기</span>
            <div className="map-seg" role="group" aria-label="설립 유형">
              {(['전체', '공립', '사립'] as EstablishFilter[]).map((v) => (
                <button key={v} className={`map-seg-btn ${filters.establish === v ? 'active' : ''}`} aria-pressed={filters.establish === v} onClick={() => setFilters({ ...filters, establish: v })}>{v}</button>
              ))}
            </div>
            <span className="map-filter-div" aria-hidden="true" />
            <button className={`map-chip ${filters.hasBus ? 'map-chip-active' : ''}`} aria-pressed={filters.hasBus} onClick={() => setFilters({ ...filters, hasBus: !filters.hasBus })}><IconBus /> 통학차량</button>
            <button className={`map-chip ${filters.hasAfterSchool ? 'map-chip-active' : ''}`} aria-pressed={filters.hasAfterSchool} onClick={() => setFilters({ ...filters, hasAfterSchool: !filters.hasAfterSchool })}><IconClock /> 방과후</button>
            <button className={`map-chip ${filters.hasAvailability ? 'map-chip-active' : ''}`} aria-pressed={filters.hasAvailability} onClick={() => setFilters({ ...filters, hasAvailability: !filters.hasAvailability })}><IconSeat /> 빈자리</button>
            <span className="map-filter-div" aria-hidden="true" />
            <select id="age-select" className="map-select map-select-sm" value={filters.age} onChange={(e) => setFilters({ ...filters, age: e.target.value as AgeFilter })} aria-label="우리 아이 나이">
              <option value="전체">나이 전체</option>
              <option value="3">만 3세</option>
              <option value="4">만 4세</option>
              <option value="5">만 5세</option>
            </select>
            <span className="map-filter-div" aria-hidden="true" />
            <select
              className="map-select map-select-sm map-preset-select"
              value={activePresetKey}
              onChange={(e) => {
                const preset = PRESETS.find((item) => item.key === e.target.value);
                if (preset) applyPreset(preset);
              }}
              aria-label="상황별 추천 조건"
            >
              <option value="">추천 조건</option>
              {PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>{preset.label}</option>
              ))}
            </select>
            {activeFilterCount > 0 && (<button className="map-filter-reset" onClick={resetFilters}>초기화</button>)}
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="map-body">
          <aside className="map-panel" aria-label="유치원 목록">
            {!hasRegion ? (
              <div className="map-panel-onboard">
                <svg className="map-onboard-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1f6f6b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <p className="map-onboard-kicker">첫 번째 퀘스트</p>
                <h2 className="map-onboard-title">우리 동네에서<br />유치원을 발견해 보세요</h2>
                <p className="map-onboard-desc">동네 이름이나 주소를 검색하거나 <strong>내 위치</strong>를 누르면<br />주변 유치원을 거리순으로 보여드려요.</p>
                <ul className="map-onboard-points">
                  <li><IconBus size={16} /> 통학차량 · 방과후 운영 여부</li>
                  <li><IconClock size={16} /> 교사 1인당 원아 수로 비교</li>
                  <li><IconSeat size={16} /> 연령별 빈자리(잔여석) 확인</li>
                </ul>
                <button className="map-onboard-cta" onClick={handleMyLocation}>내 위치로 찾기</button>
              </div>
            ) : selected ? (
              <DetailView
                selected={selected}
                onBack={() => setSelected(null)}
                distance={selDist}
                showDetails={showDetailDetails}
                toggleDetails={() => setShowDetailDetails((s) => !s)}
                comparing={isComparing(selected.kindercode)}
                onToggleCompare={() => toggleCompare(selected)}
              />
            ) : (
              <div className="map-list">
                <div className="map-list-head">
                  <span className="map-list-count" role="status" aria-live="polite">
                    발견한 유치원 <strong>{display.length}</strong>곳
                    {display.length !== kindergartens.length && (<span className="map-list-total"> (전체 {kindergartens.length}곳)</span>)}
                  </span>
                </div>
                {loading ? (
                  <div className="map-list-loading" aria-busy="true"><div className="map-spinner" /><span>유치원 정보를 불러오는 중...</span></div>
                ) : display.length === 0 ? (
                  <div className="map-list-empty">
                    <p>조건에 맞는 유치원이 없어요.</p>
                    {activeFilterCount > 0 && (<button className="map-onboard-cta map-empty-reset" onClick={resetFilters}>필터 초기화</button>)}
                  </div>
                ) : (
                  <ul className="map-cards">
                    {display.map((k) => {
                      const seats = ageSeats(k, filters.age);
                      const pub = isPublic(k.establish);
                      const cmp = isComparing(k.kindercode);
                      return (
                        <li key={k.kindercode}>
                          <div className={`map-card ${hovered === k.kindercode ? 'hovered' : ''}`} onMouseEnter={() => setHovered(k.kindercode)} onMouseLeave={() => setHovered(null)}>
                            <button className="map-card-main" onClick={() => selectCard(k)}>
                              <div className="map-card-top">
                                <span className={`map-type-dot ${pub ? 'pub' : 'priv'}`} aria-hidden="true">{pub ? '공' : '사'}</span>
                                <span className="map-card-name">{k.name}</span>
                              </div>
                              <div className="map-card-meta">
                                <span className="map-card-type">{getEstablishLabel(k.establish)}</span>
                                {k.distance != null && <span className="map-card-dist">집에서 {formatDistance(k.distance)}</span>}
                                {k.teacherStudentRatio > 0 && <span className="map-card-tag">교사 1명당 {k.teacherStudentRatio}명</span>}
                              </div>
                              <div className="map-card-signals">
                                <span className="map-sig"><IconSeat /> {filters.age !== '전체' ? `만${filters.age}세 ` : ''}{seats > 0 ? `빈자리 ${seats}석` : '정원 충원'}</span>
                                {k.hasBus && <span className="map-sig"><IconBus /> 통학</span>}
                                {k.hasAfterSchool && <span className="map-sig"><IconClock /> 방과후</span>}
                              </div>
                            </button>
                            <button
                              className={`map-card-cmp ${cmp ? 'on' : ''}`}
                              onClick={() => toggleCompare(k)}
                              aria-pressed={cmp}
                              aria-label={cmp ? `${k.name} 비교에서 빼기` : `${k.name} 비교에 담기`}
                            >
                              {cmp ? '✓ 담음' : '+ 비교'}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </aside>

          <div className="map-container">
            <div ref={mapRef} className="map-canvas" />
            <div className="map-toast-wrap" role="status" aria-live="polite">{searchMsg && <div className="map-toast">{searchMsg}</div>}</div>
            {!hasRegion && !loading && (<div className="map-hint">동네를 검색하거나 지역을 선택하세요</div>)}
            {hasRegion && !loading && summary && (
              <div className="map-summary-overlay" role="status" aria-live="polite">
                <strong className="map-summary-overlay-n">{summary.n}곳</strong>
                <span className="map-summary-overlay-sep" aria-hidden="true" />
                <span>국공립 {summary.pubPct}%</span>
                <span className="map-summary-overlay-sep" aria-hidden="true" />
                <span>빈자리 {summary.withSeat}곳</span>
                {summary.avgRatio > 0 && (
                  <>
                    <span className="map-summary-overlay-sep" aria-hidden="true" />
                    <span>평균 교사 1:{summary.avgRatio}</span>
                  </>
                )}
              </div>
            )}
            <button
              type="button"
              className="km-fab"
              onClick={handleMyLocation}
              disabled={locating}
              aria-label="내 위치로 이동"
              title="내 위치"
            >
              {locating ? (
                <span className="km-fab-spin" aria-hidden="true" />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
              )}
            </button>
            <div className="map-legend">
              <span className="map-legend-item"><span className="map-legend-dot map-legend-public">공</span>공립</span>
              <span className="map-legend-item"><span className="map-legend-dot map-legend-private">사</span>사립</span>
              <span className="map-legend-note">색상은 분류용이며 우열을 뜻하지 않아요</span>
            </div>
          </div>

          {/* Compare bar */}
          {compareList.length > 0 && !showCompare && (
            <div className="map-cmp-bar">
              <div className="map-cmp-bar-items">
                <span className="map-cmp-bar-label">비교 가방</span>
                {compareList.map((k) => (
                  <span key={k.kindercode} className="map-cmp-tag">
                    {k.name}
                    <button onClick={() => toggleCompare(k)} aria-label={`${k.name} 빼기`}>×</button>
                  </span>
                ))}
              </div>
              <div className="map-cmp-bar-actions">
                <button className="map-cmp-clear" onClick={() => setCompareList([])}>전체 비우기</button>
                <button className="map-cmp-go" onClick={() => setShowCompare(true)} disabled={compareList.length < 2}>
                  나란히 비교 ({compareList.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {showCompare && (
          <CompareView list={compareList} home={home} onClose={() => setShowCompare(false)} onRemove={toggleCompare} />
        )}
      </main>

    </>
  );
}

// ===== Detail =====
function DetailView({
  selected, onBack, distance, showDetails, toggleDetails, comparing, onToggleCompare,
}: {
  selected: KG; onBack: () => void; distance: number | null; showDetails: boolean; toggleDetails: () => void; comparing: boolean; onToggleCompare: () => void;
}) {
  const years = getYears(selected.edate);
  const endTime = getEndTime(selected.opertime);
  const seats = selected.availableSeats;
  const pct = capPercent(selected);
  return (
    <div className="map-detail">
      <button className="map-detail-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        목록으로
      </button>

      <div className="map-detail-head">
        <span className={`map-badge ${isPublic(selected.establish) ? 'map-badge-public' : 'map-badge-private'}`}>{getEstablishLabel(selected.establish)}</span>
        {years > 0 && <span className="map-badge map-badge-neutral">운영 {years}년차</span>}
      </div>
      <h2 className="map-detail-name">{selected.name}</h2>
      <p className="map-detail-addr">{selected.addr}{distance != null && <span className="map-detail-dist"> · 집에서 약 {formatDistance(distance)}</span>}</p>

      <div className="map-detail-contact">
        {selected.telno && (
          <a href={`tel:${formatPhone(selected.telno)}`} className="map-contact-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>전화
          </a>
        )}
        {selected.hpaddr && (
          <a href={selected.hpaddr.startsWith('http') ? selected.hpaddr : `https://${selected.hpaddr}`} target="_blank" rel="noopener noreferrer" className="map-contact-link" aria-label="홈페이지 새 창에서 열기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>홈페이지
          </a>
        )}
        <button className={`map-contact-link map-detail-cmp ${comparing ? 'on' : ''}`} onClick={onToggleCompare} aria-pressed={comparing}>
          {comparing ? '✓ 비교 담음' : '+ 비교 담기'}
        </button>
      </div>

      <div className="map-summary">
        <div className="map-summary-item"><span className="map-summary-label">빈자리</span><span className="map-summary-value">{seats > 0 ? `${seats}석` : '정원 충원'}</span></div>
        <div className="map-summary-item"><span className="map-summary-label">운영시간</span><span className="map-summary-value">{endTime ? `~ ${endTime}` : selected.opertime || '-'}</span></div>
        <div className="map-summary-item"><span className="map-summary-label">통학차량</span><span className="map-summary-value">{selected.hasBus ? `운행 (${selected.busCount}대)` : '없음'}</span></div>
        <div className="map-summary-item"><span className="map-summary-label">방과후</span><span className="map-summary-value">{selected.hasAfterSchool ? '운영' : '없음'}</span></div>
      </div>

      <div className="map-section">
        <h3 className="map-section-title">원아 현황</h3>
        <div className="map-capacity-header"><span>현원 <strong>{selected.totalStudents}명</strong></span><span>정원 <strong>{selected.capacity}명</strong></span></div>
        <div className="map-capacity-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`충원율 ${pct}%`}>
          <div className="map-capacity-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="map-capacity-note">충원율 {pct}% · {seats > 0 ? `현재 ${seats}석 여유 — 바로 상담 가능할 수 있어요` : '정원이 모두 찼어요 — 대기 가능 여부는 원에 문의하세요'}</p>
      </div>

      <div className="map-section">
        <h3 className="map-section-title">교사 대 원아</h3>
        {selected.teacherStudentRatio > 0 ? (
          <>
            <p className="map-ratio">교사 1명당 <strong>{selected.teacherStudentRatio}명</strong></p>
            <p className="map-ratio-note">원장·원감·일반·특수교사를 합한 전체 교사 기준이에요. 숫자가 작을수록 교사 1명이 돌보는 원아가 적어요.</p>
          </>
        ) : (<p className="map-section-empty">교사 정보 없음</p>)}
      </div>

      <div className="map-section">
        <h3 className="map-section-title">급식</h3>
        {selected.mealType ? (
          <div className="map-info-grid">
            <div className="map-info-row"><span>급식 방식</span><strong>{formatMeal(selected.mealType)}</strong></div>
            <div className="map-info-row"><span>영양사</span><span>{selected.hasNutritionist ? '있음' : '없음'}</span></div>
          </div>
        ) : (<p className="map-section-empty">급식 정보 없음</p>)}
      </div>

      <button className="map-detail-toggle" onClick={toggleDetails} aria-expanded={showDetails}>{showDetails ? '상세 정보 접기 ▲' : '연령별·교직원 상세 보기 ▼'}</button>
      {showDetails && (
        <>
          <div className="map-section">
            <h3 className="map-section-title">연령별 현황</h3>
            <div className="map-age-grid">
              <AgeItem label="만 3세" cls={selected.clcnt3} pp={selected.ppcnt3} cap={selected.ag3fpcnt} />
              <AgeItem label="만 4세" cls={selected.clcnt4} pp={selected.ppcnt4} cap={selected.ag4fpcnt} />
              <AgeItem label="만 5세" cls={selected.clcnt5} pp={selected.ppcnt5} cap={selected.ag5fpcnt} />
              {selected.mixclcnt > 0 && <AgeItem label="혼합반" cls={selected.mixclcnt} pp={selected.mixppcnt} />}
              {selected.shclcnt > 0 && <AgeItem label="특수학급" cls={selected.shclcnt} pp={selected.shppcnt} />}
            </div>
          </div>
          <div className="map-section">
            <h3 className="map-section-title">교직원 현황</h3>
            <div className="map-info-grid">
              <div className="map-info-row"><span>전체 교사</span><strong>{selected.totalTeachers}명</strong></div>
              {selected.gnrl_thcnt > 0 && <div className="map-info-row map-info-sub"><span>일반교사</span><span>{selected.gnrl_thcnt}명</span></div>}
              {selected.spcn_thcnt > 0 && <div className="map-info-row map-info-sub"><span>특수교사</span><span>{selected.spcn_thcnt}명</span></div>}
              {selected.etc_emp_cnt > 0 && <div className="map-info-row map-info-sub"><span>기타 직원</span><span>{selected.etc_emp_cnt}명</span></div>}
            </div>
          </div>
          {selected.hasAfterSchool && (
            <div className="map-section">
              <h3 className="map-section-title">방과후 과정</h3>
              <div className="map-info-grid">
                <div className="map-info-row"><span>학급 수</span><strong>{selected.afterSchoolClasses}반</strong></div>
                <div className="map-info-row"><span>참여 원아</span><strong>{selected.afterSchoolStudents}명</strong></div>
                {selected.afterSchoolTime && <div className="map-info-row"><span>운영 시간</span><span>{selected.afterSchoolTime}</span></div>}
              </div>
            </div>
          )}
          {selected.edate && (
            <div className="map-section map-detail-foot">
              <span>설립일 {selected.edate.slice(0, 4)}.{selected.edate.slice(4, 6)}.{selected.edate.slice(6, 8)}</span>
              {selected.rppnname && <span>대표자 {selected.rppnname}</span>}
            </div>
          )}
        </>
      )}
      <p className="map-detail-src">자료: 유치원알리미(교육부) 공개 데이터</p>
    </div>
  );
}

function AgeItem({ label, cls, pp, cap }: { label: string; cls: number; pp: number; cap?: number }) {
  return (
    <div className="map-age-item">
      <span className="map-age-label">{label}</span>
      <span className="map-age-value">{cls}반 · {pp}명</span>
      {cap != null && cap > 0 && <span className="map-age-cap">정원 {cap}명</span>}
    </div>
  );
}

// ===== Compare =====
function CompareView({ list, home, onClose, onRemove }: { list: KG[]; home: HomePoint | null; onClose: () => void; onRemove: (k: KG) => void }) {
  const rows: { label: string; render: (k: KG) => React.ReactNode }[] = [
    { label: '설립 유형', render: (k) => getEstablishLabel(k.establish) },
    { label: '집에서 거리', render: (k) => (home ? formatDistance(distanceKm(home.lat, home.lng, k.lat, k.lng)) : '—') },
    { label: '빈자리', render: (k) => (k.availableSeats > 0 ? `${k.availableSeats}석` : '정원 충원') },
    { label: '충원율', render: (k) => `${capPercent(k)}%` },
    { label: '교사 1인당 원아', render: (k) => (k.teacherStudentRatio > 0 ? `${k.teacherStudentRatio}명` : '—') },
    { label: '운영시간', render: (k) => (getEndTime(k.opertime) ? `~ ${getEndTime(k.opertime)}` : k.opertime || '—') },
    { label: '통학차량', render: (k) => (k.hasBus ? `운행 (${k.busCount}대)` : '없음') },
    { label: '방과후', render: (k) => (k.hasAfterSchool ? '운영' : '없음') },
    { label: '급식', render: (k) => (k.mealType ? formatMeal(k.mealType) : '—') },
    { label: '영양사', render: (k) => (k.hasNutritionist ? '있음' : '없음') },
    { label: '운영 연차', render: (k) => (getYears(k.edate) > 0 ? `${getYears(k.edate)}년차` : '—') },
    { label: '전화', render: (k) => (k.telno ? <a href={`tel:${formatPhone(k.telno)}`}>{k.telno}</a> : '—') },
  ];
  return (
    <div className="map-cmp-overlay" role="dialog" aria-modal="true" aria-label="유치원 비교">
      <div className="map-cmp-modal">
        <div className="map-cmp-modal-head">
          <h2>유치원 나란히 비교</h2>
          <button className="map-cmp-close" onClick={onClose} aria-label="비교 닫기">×</button>
        </div>
        <div className="map-cmp-scroll">
          <table className="map-cmp-table">
            <thead>
              <tr>
                <th className="map-cmp-rowhead" />
                {list.map((k) => (
                  <th key={k.kindercode}>
                    <span className={`map-type-dot ${isPublic(k.establish) ? 'pub' : 'priv'}`} aria-hidden="true">{isPublic(k.establish) ? '공' : '사'}</span>
                    <span className="map-cmp-name">{k.name}</span>
                    <button className="map-cmp-th-remove" onClick={() => onRemove(k)} aria-label={`${k.name} 비교에서 빼기`}>빼기</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="map-cmp-rowhead">{row.label}</td>
                  {list.map((k) => (<td key={k.kindercode}>{row.render(k)}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="map-cmp-note">수치는 사실 정보이며 우열 판단은 가정의 우선순위에 따라 달라질 수 있어요. 자료: 유치원알리미(교육부).</p>
      </div>
    </div>
  );
}
