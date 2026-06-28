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
}

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

// 급식 운영방식 코드/문자 → 사람이 읽는 라벨
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

// 운영시간에서 종료 시각만 강조 추출 (예: "09시00분~16시00분")
function getEndTime(opertime: string) {
  if (!opertime) return '';
  const m = opertime.split('~');
  return m.length > 1 ? m[1].trim() : '';
}

// 운영 연차
function getYears(edate: string) {
  if (!edate || edate.length < 4) return 0;
  const year = Number(edate.slice(0, 4));
  if (!year) return 0;
  return Math.max(0, 2026 - year);
}

// 두 좌표 간 직선거리(km)
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

// 연령별 잔여석
function ageSeats(k: Kindergarten, age: AgeFilter) {
  if (age === '3') return k.ag3fpcnt - k.ppcnt3;
  if (age === '4') return k.ag4fpcnt - k.ppcnt4;
  if (age === '5') return k.ag5fpcnt - k.ppcnt5;
  return k.availableSeats;
}

// 시군구 코드 → 시도 코드 매핑 (regions 기반)
const SGG_TO_SIDO = new Map<string, string>();
regions.forEach((sido) => sido.sgg.forEach((s) => SGG_TO_SIDO.set(s.code, sido.code)));

// SVG 마커 (공/사 글자 + 상태별 크기)
function markerSvg(isPub: boolean, state: 'base' | 'hover' | 'selected') {
  // 가치중립적 색쌍: 공립=청록, 사립=보라 (둘 다 신뢰 계열, 우열 인상 최소화)
  const color = isPub ? '#2f8f8a' : '#7a6cd1';
  const w = state === 'selected' ? 34 : 28;
  const h = state === 'selected' ? 44 : 36;
  const r = state === 'selected' ? 7.5 : 6;
  const cy = state === 'selected' ? 16 : 13;
  const stroke = state === 'base' ? '' : '<path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="none" stroke="#1b1c1f" stroke-width="1.5"/>';
  const scale = state === 'selected' ? 'transform="scale(1.21)"' : '';
  const label = isPub ? '공' : '사';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${state === 'selected' ? 34 : 28} ${state === 'selected' ? 44 : 36}"><g ${scale}><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>${stroke}<circle cx="14" cy="${cy - (state === 'selected' ? 3 : 0)}" r="${r}" fill="white"/><text x="14" y="${cy - (state === 'selected' ? 3 : 0) + 3.5}" font-size="9" font-weight="700" text-anchor="middle" fill="${color}" font-family="sans-serif">${label}</text></g></svg>`;
  return svg;
}

function makeMarkerImage(kakao: any, isPub: boolean, state: 'base' | 'hover' | 'selected') {
  const w = state === 'selected' ? 34 : 28;
  const h = state === 'selected' ? 44 : 36;
  const encoded = encodeURIComponent(markerSvg(isPub, state));
  return new kakao.maps.MarkerImage(
    `data:image/svg+xml,${encoded}`,
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
  const homeCircleRef = useRef<any>(null);

  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSgg, setSelectedSgg] = useState('');
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Kindergarten | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [home, setHome] = useState<HomePoint | null>(null);
  const [search, setSearch] = useState('');
  const [searchMsg, setSearchMsg] = useState('');
  const [showDetailDetails, setShowDetailDetails] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    establish: '전체',
    age: '전체',
    hasBus: false,
    hasAfterSchool: false,
    hasAvailability: false,
  });
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const currentSido = regions.find((r) => r.code === selectedSido);

  // 거리 캐시
  const withDistance = useMemo(() => {
    return kindergartens.map((k) => ({
      ...k,
      distance: home ? distanceKm(home.lat, home.lng, k.lat, k.lng) : null,
    }));
  }, [kindergartens, home]);

  // 필터 (마커 + 리스트 공통)
  const filtered = useMemo(() => {
    return withDistance.filter((k) => {
      if (filters.establish === '공립' && !isPublic(k.establish)) return false;
      if (filters.establish === '사립' && isPublic(k.establish)) return false;
      if (filters.hasBus && !k.hasBus) return false;
      if (filters.hasAfterSchool && !k.hasAfterSchool) return false;
      if (filters.hasAvailability && ageSeats(k, filters.age) <= 0) return false;
      return true;
    });
  }, [withDistance, filters]);

  // 정렬 (리스트 표시용)
  const display = useMemo(() => {
    const arr = [...filtered];
    const effSort: SortKey = sortKey === 'distance' && !home ? 'name' : sortKey;
    arr.sort((a, b) => {
      if (effSort === 'distance') return (a.distance ?? 9e9) - (b.distance ?? 9e9);
      if (effSort === 'availability') return ageSeats(b, filters.age) - ageSeats(a, filters.age);
      if (effSort === 'ratio') {
        const ra = a.teacherStudentRatio || 9e9;
        const rb = b.teacherStudentRatio || 9e9;
        return ra - rb;
      }
      return a.name.localeCompare(b.name, 'ko');
    });
    return arr;
  }, [filtered, sortKey, home, filters.age]);

  const activeFilterCount = [
    filters.establish !== '전체',
    filters.age !== '전체',
    filters.hasBus,
    filters.hasAfterSchool,
    filters.hasAvailability,
  ].filter(Boolean).length;

  // 지도 초기화
  useEffect(() => {
    if (!kakaoLoaded || !mapRef.current || mapInstanceRef.current) return;
    const kakao = window.kakao;
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });
    mapInstanceRef.current = map;
  }, [kakaoLoaded]);

  const getImage = useCallback((isPub: boolean, state: 'base' | 'hover' | 'selected') => {
    const key = `${isPub ? 'p' : 'v'}-${state}`;
    if (!imageCacheRef.current[key]) {
      imageCacheRef.current[key] = makeMarkerImage(window.kakao, isPub, state);
    }
    return imageCacheRef.current[key];
  }, []);

  // 마커 배치 (filtered 변경 시)
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !map) return;

    markersByCodeRef.current.forEach((m) => m.setMap(null));
    markersByCodeRef.current = new Map();

    if (filtered.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();
    filtered.forEach((k) => {
      const pos = new kakao.maps.LatLng(k.lat, k.lng);
      bounds.extend(pos);
      const marker = new kakao.maps.Marker({
        map,
        position: pos,
        image: getImage(isPublic(k.establish), 'base'),
        title: k.name,
      });
      kakao.maps.event.addListener(marker, 'click', () => {
        setSelected(k);
        setShowDetailDetails(false);
      });
      kakao.maps.event.addListener(marker, 'mouseover', () => setHovered(k.kindercode));
      kakao.maps.event.addListener(marker, 'mouseout', () => setHovered(null));
      markersByCodeRef.current.set(k.kindercode, marker);
    });

    if (home) bounds.extend(new kakao.maps.LatLng(home.lat, home.lng));
    map.setBounds(bounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, kakaoLoaded]);

  // 마커 강조 (선택/호버)
  useEffect(() => {
    markersByCodeRef.current.forEach((marker, code) => {
      const k = kindergartens.find((x) => x.kindercode === code);
      if (!k) return;
      const pub = isPublic(k.establish);
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
  }, [selected, hovered, kindergartens, getImage]);

  // 선택 시 지도 이동
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selected) return;
    map.panTo(new window.kakao.maps.LatLng(selected.lat, selected.lng));
  }, [selected]);

  // 집 마커/반경
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapInstanceRef.current;
    if (!kakao || !map) return;
    if (homeMarkerRef.current) homeMarkerRef.current.setMap(null);
    if (homeCircleRef.current) homeCircleRef.current.setMap(null);
    if (!home) return;
    const pos = new kakao.maps.LatLng(home.lat, home.lng);
    homeMarkerRef.current = new kakao.maps.Marker({
      map,
      position: pos,
      image: homeMarkerImage(kakao),
      zIndex: 200,
    });
    homeCircleRef.current = new kakao.maps.Circle({
      map,
      center: pos,
      radius: 1000,
      strokeWeight: 1,
      strokeColor: '#1b1c1f',
      strokeOpacity: 0.4,
      strokeStyle: 'shortdash',
      fillColor: '#f6c945',
      fillOpacity: 0.08,
    });
  }, [home, kakaoLoaded]);

  // 데이터 fetch
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

  // 좌표 → 지역 매칭 후 fetch + 집 설정
  const applyCoords = useCallback(
    (lat: number, lng: number, label: string) => {
      const kakao = window.kakao;
      if (!kakao?.maps?.services) return;
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2RegionCode(lng, lat, (result: any[], status: any) => {
        if (status !== kakao.maps.services.Status.OK) {
          setSearchMsg('위치를 확인할 수 없습니다.');
          return;
        }
        const region = result.find((r) => r.region_type === 'B') || result[0];
        const sgg = region?.code?.slice(0, 5);
        const sido = SGG_TO_SIDO.get(sgg);
        setHome({ lat, lng, label });
        setSearchMsg('');
        if (sido && sgg) {
          setSelectedSido(sido);
          setSelectedSgg(sgg);
          setSortKey('distance');
          fetchData(sido, sgg);
        } else {
          setSearchMsg('아직 이 지역은 지원하지 않아요. 가까운 시/군/구를 직접 선택해 주세요.');
          const map = mapInstanceRef.current;
          if (map) map.setCenter(new kakao.maps.LatLng(lat, lng));
        }
      });
    },
    [fetchData]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    const kakao = window.kakao;
    if (!kakao?.maps?.services) {
      setSearchMsg('지도를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setSearchMsg('검색 중...');
    const places = new kakao.maps.services.Places();
    places.keywordSearch(q, (data: any[], status: any) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const top = data[0];
        applyCoords(Number(top.y), Number(top.x), top.place_name || q);
      } else {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(q, (res: any[], st: any) => {
          if (st === kakao.maps.services.Status.OK && res.length > 0) {
            applyCoords(Number(res[0].y), Number(res[0].x), res[0].address_name || q);
          } else {
            setSearchMsg('검색 결과가 없어요. 동/도로명 또는 건물명을 입력해 보세요.');
          }
        });
      }
    });
  }

  function handleMyLocation() {
    if (!navigator.geolocation) {
      setSearchMsg('이 브라우저에서는 위치 기능을 지원하지 않아요.');
      return;
    }
    setSearchMsg('현재 위치를 찾는 중...');
    navigator.geolocation.getCurrentPosition(
      (pos) => applyCoords(pos.coords.latitude, pos.coords.longitude, '현재 위치'),
      () => setSearchMsg('위치 권한이 필요해요. 동네 이름으로 검색해 주세요.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function selectCard(k: Kindergarten & { distance?: number | null }) {
    setSelected(k);
    setShowDetailDetails(false);
    const map = mapInstanceRef.current;
    if (map) map.panTo(new window.kakao.maps.LatLng(k.lat, k.lng));
  }

  function resetFilters() {
    setFilters({ establish: '전체', age: '전체', hasBus: false, hasAfterSchool: false, hasAvailability: false });
  }

  const capacityPercent =
    selected && selected.capacity > 0
      ? Math.min(100, Math.round((selected.totalStudents / selected.capacity) * 100))
      : 0;

  const selDist = selected && home ? distanceKm(home.lat, home.lng, selected.lat, selected.lng) : null;

  const hasRegion = !!selectedSgg;

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          window.kakao.maps.load(() => setKakaoLoaded(true));
        }}
      />
      <main className="map-page">
        {/* ===== Toolbar ===== */}
        <div className="map-toolbar">
          <div className="map-toolbar-inner">
            <form className="map-search" onSubmit={handleSearch} role="search">
              <svg className="map-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                type="text"
                className="map-search-input"
                placeholder="동네·주소·건물명으로 검색 (예: 역삼동)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="동네 또는 주소 검색"
              />
              <button type="submit" className="map-search-btn">검색</button>
            </form>
            <button type="button" className="map-loc-btn" onClick={handleMyLocation} aria-label="내 위치로 찾기">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
              내 위치
            </button>
            <div className="map-selectors">
              <select
                className="map-select"
                value={selectedSido}
                onChange={(e) => handleSidoChange(e.target.value)}
                aria-label="시/도 선택"
              >
                <option value="">시/도</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
              <select
                className="map-select"
                value={selectedSgg}
                onChange={(e) => handleSggChange(e.target.value)}
                disabled={!selectedSido}
                aria-label="시/군/구 선택"
              >
                <option value="">시/군/구</option>
                {currentSido?.sgg.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter bar — 항상 노출 */}
          <div className="map-filterbar" role="group" aria-label="필터 및 정렬">
            <div className="map-seg" role="group" aria-label="설립 유형">
              {(['전체', '공립', '사립'] as EstablishFilter[]).map((v) => (
                <button
                  key={v}
                  className={`map-seg-btn ${filters.establish === v ? 'active' : ''}`}
                  aria-pressed={filters.establish === v}
                  onClick={() => setFilters({ ...filters, establish: v })}
                >
                  {v}
                </button>
              ))}
            </div>
            <span className="map-filter-div" aria-hidden="true" />
            <button
              className={`map-chip ${filters.hasBus ? 'map-chip-active' : ''}`}
              aria-pressed={filters.hasBus}
              onClick={() => setFilters({ ...filters, hasBus: !filters.hasBus })}
            >
              🚌 통학차량
            </button>
            <button
              className={`map-chip ${filters.hasAfterSchool ? 'map-chip-active' : ''}`}
              aria-pressed={filters.hasAfterSchool}
              onClick={() => setFilters({ ...filters, hasAfterSchool: !filters.hasAfterSchool })}
            >
              🕒 방과후
            </button>
            <button
              className={`map-chip ${filters.hasAvailability ? 'map-chip-active' : ''}`}
              aria-pressed={filters.hasAvailability}
              onClick={() => setFilters({ ...filters, hasAvailability: !filters.hasAvailability })}
            >
              빈자리 있음
            </button>
            <span className="map-filter-div" aria-hidden="true" />
            <label className="map-inline-label" htmlFor="age-select">우리 아이</label>
            <select
              id="age-select"
              className="map-select map-select-sm"
              value={filters.age}
              onChange={(e) => setFilters({ ...filters, age: e.target.value as AgeFilter })}
              aria-label="우리 아이 나이"
            >
              <option value="전체">나이 전체</option>
              <option value="3">만 3세</option>
              <option value="4">만 4세</option>
              <option value="5">만 5세</option>
            </select>
            {activeFilterCount > 0 && (
              <button className="map-filter-reset" onClick={resetFilters}>초기화</button>
            )}
            <div className="map-filterbar-right">
              <label className="map-inline-label" htmlFor="sort-select">정렬</label>
              <select
                id="sort-select"
                className="map-select map-select-sm"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label="정렬 기준"
              >
                <option value="distance" disabled={!home}>가까운 순{!home ? ' (위치 필요)' : ''}</option>
                <option value="name">이름순</option>
                <option value="availability">빈자리 많은 순</option>
                <option value="ratio">교사 1인당 원아 적은 순</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="map-body">
          {/* Left panel: list or detail */}
          <aside className="map-panel" aria-label="유치원 목록">
            {!hasRegion ? (
              <div className="map-panel-onboard">
                <div className="map-onboard-icon" aria-hidden="true">🗺️</div>
                <h2 className="map-onboard-title">우리 동네 유치원을<br />한눈에 비교해 보세요</h2>
                <p className="map-onboard-desc">
                  동네 이름이나 주소를 검색하거나 <strong>내 위치</strong>를 누르면<br />
                  주변 유치원을 거리순으로 보여드려요.
                </p>
                <ul className="map-onboard-points">
                  <li>🚌 통학차량 · 🕒 방과후 운영 여부</li>
                  <li>👩‍🏫 교사 1인당 원아 수로 비교</li>
                  <li>🪑 연령별 빈자리(잔여석) 확인</li>
                </ul>
                <button className="map-onboard-cta" onClick={handleMyLocation}>내 위치로 찾기</button>
              </div>
            ) : selected ? (
              <DetailView
                selected={selected}
                onBack={() => setSelected(null)}
                distance={selDist}
                capacityPercent={capacityPercent}
                showDetails={showDetailDetails}
                toggleDetails={() => setShowDetailDetails((s) => !s)}
              />
            ) : (
              <div className="map-list">
                <div className="map-list-head">
                  <span className="map-list-count">
                    유치원 <strong>{display.length}</strong>곳
                    {display.length !== kindergartens.length && (
                      <span className="map-list-total"> (전체 {kindergartens.length}곳)</span>
                    )}
                  </span>
                </div>
                {loading ? (
                  <div className="map-list-loading">
                    <div className="map-spinner" />
                    <span>유치원 정보를 불러오는 중...</span>
                  </div>
                ) : display.length === 0 ? (
                  <div className="map-list-empty">
                    조건에 맞는 유치원이 없어요.<br />필터를 줄이거나 다른 지역을 선택해 보세요.
                  </div>
                ) : (
                  <ul className="map-cards">
                    {display.map((k) => {
                      const seats = ageSeats(k, filters.age);
                      const pub = isPublic(k.establish);
                      return (
                        <li key={k.kindercode}>
                          <button
                            className={`map-card ${hovered === k.kindercode ? 'hovered' : ''}`}
                            onMouseEnter={() => setHovered(k.kindercode)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => selectCard(k)}
                          >
                            <div className="map-card-top">
                              <span className={`map-type-dot ${pub ? 'pub' : 'priv'}`} aria-hidden="true">{pub ? '공' : '사'}</span>
                              <span className="map-card-name">{k.name}</span>
                              {k.distance != null && (
                                <span className="map-card-dist">{formatDistance(k.distance)}</span>
                              )}
                            </div>
                            <div className="map-card-meta">
                              <span className="map-card-type">{getEstablishLabel(k.establish)}</span>
                              {k.teacherStudentRatio > 0 && (
                                <span className="map-card-tag">교사 1명당 {k.teacherStudentRatio}명</span>
                              )}
                            </div>
                            <div className="map-card-signals">
                              <span className={`map-sig ${seats > 0 ? 'on' : 'off'}`}>
                                {filters.age !== '전체' ? `만${filters.age}세 ` : ''}빈자리 {seats > 0 ? `${seats}석` : '없음'}
                              </span>
                              {k.hasBus && <span className="map-sig">🚌 통학</span>}
                              {k.hasAfterSchool && <span className="map-sig">🕒 방과후</span>}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </aside>

          {/* Map */}
          <div className="map-container">
            <div ref={mapRef} className="map-canvas" />
            {searchMsg && <div className="map-toast">{searchMsg}</div>}
            {!hasRegion && !loading && (
              <div className="map-hint">← 왼쪽에서 동네를 검색하거나 지역을 선택하세요</div>
            )}
            <div className="map-legend">
              <span className="map-legend-item"><span className="map-legend-dot map-legend-public">공</span>공립</span>
              <span className="map-legend-item"><span className="map-legend-dot map-legend-private">사</span>사립</span>
              <span className="map-legend-note">색상은 분류용이며 우열을 뜻하지 않아요</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ===== Detail view =====
function DetailView({
  selected,
  onBack,
  distance,
  capacityPercent,
  showDetails,
  toggleDetails,
}: {
  selected: Kindergarten;
  onBack: () => void;
  distance: number | null;
  capacityPercent: number;
  showDetails: boolean;
  toggleDetails: () => void;
}) {
  const years = getYears(selected.edate);
  const endTime = getEndTime(selected.opertime);
  const seats = selected.availableSeats;
  return (
    <div className="map-detail">
      <button className="map-detail-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        목록으로
      </button>

      <div className="map-detail-head">
        <span className={`map-badge ${isPublic(selected.establish) ? 'map-badge-public' : 'map-badge-private'}`}>
          {getEstablishLabel(selected.establish)}
        </span>
        {years > 0 && <span className="map-badge map-badge-neutral">운영 {years}년차</span>}
      </div>
      <h2 className="map-detail-name">{selected.name}</h2>
      <p className="map-detail-addr">
        {selected.addr}
        {distance != null && <span className="map-detail-dist"> · 약 {formatDistance(distance)}</span>}
      </p>

      <div className="map-detail-contact">
        {selected.telno && (
          <a href={`tel:${formatPhone(selected.telno)}`} className="map-contact-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
            전화
          </a>
        )}
        {selected.hpaddr && (
          <a
            href={selected.hpaddr.startsWith('http') ? selected.hpaddr : `http://${selected.hpaddr}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-contact-link"
            aria-label="홈페이지 새 창에서 열기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
            홈페이지
          </a>
        )}
      </div>

      {/* 한눈에 보기 */}
      <div className="map-summary">
        <div className="map-summary-item">
          <span className="map-summary-label">운영시간</span>
          <span className="map-summary-value">{endTime ? `~ ${endTime}` : selected.opertime || '-'}</span>
        </div>
        <div className="map-summary-item">
          <span className="map-summary-label">통학차량</span>
          <span className="map-summary-value">{selected.hasBus ? `운행 (${selected.busCount}대)` : '없음'}</span>
        </div>
        <div className="map-summary-item">
          <span className="map-summary-label">방과후</span>
          <span className="map-summary-value">{selected.hasAfterSchool ? '운영' : '없음'}</span>
        </div>
        <div className="map-summary-item">
          <span className="map-summary-label">빈자리</span>
          <span className="map-summary-value">{seats > 0 ? `${seats}석` : '없음'}</span>
        </div>
      </div>

      {/* 원아 현황 (중립) */}
      <div className="map-section">
        <h3 className="map-section-title">원아 현황</h3>
        <div className="map-capacity-header">
          <span>현원 <strong>{selected.totalStudents}명</strong></span>
          <span>정원 <strong>{selected.capacity}명</strong></span>
        </div>
        <div className="map-capacity-bar">
          <div className="map-capacity-fill" style={{ width: `${capacityPercent}%` }} />
        </div>
        <p className="map-capacity-note">
          충원율 {capacityPercent}% ·{' '}
          {seats > 0
            ? `현재 ${seats}석 여유 — 바로 상담 가능할 수 있어요`
            : '정원이 모두 찼어요 — 대기 가능 여부는 원에 문의하세요'}
        </p>
      </div>

      {/* 교사 비율 */}
      <div className="map-section">
        <h3 className="map-section-title">교사 대 원아</h3>
        {selected.teacherStudentRatio > 0 ? (
          <>
            <p className="map-ratio">교사 1명당 <strong>{selected.teacherStudentRatio}명</strong></p>
            <p className="map-ratio-note">원장·특수교사 포함 전체 교직원 기준이에요. 숫자가 작을수록 한 명의 교사가 돌보는 원아가 적어요.</p>
          </>
        ) : (
          <p className="map-section-empty">교사 정보 없음</p>
        )}
      </div>

      {/* 급식 */}
      <div className="map-section">
        <h3 className="map-section-title">급식</h3>
        {selected.mealType ? (
          <div className="map-info-grid">
            <div className="map-info-row"><span>급식 방식</span><strong>{formatMeal(selected.mealType)}</strong></div>
            <div className="map-info-row"><span>영양사</span><span>{selected.hasNutritionist ? '있음' : '없음'}</span></div>
          </div>
        ) : (
          <p className="map-section-empty">급식 정보 없음</p>
        )}
      </div>

      {/* 더보기: 연령별/교직원 상세 */}
      <button className="map-detail-toggle" onClick={toggleDetails} aria-expanded={showDetails}>
        {showDetails ? '상세 정보 접기 ▲' : '연령별·교직원 상세 보기 ▼'}
      </button>
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
