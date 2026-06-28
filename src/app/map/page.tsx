'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

interface Filters {
  establish: EstablishFilter;
  hasBus: boolean;
  hasAfterSchool: boolean;
  hasAvailability: boolean;
}

function isPublic(establish: string) {
  return establish?.includes('공립');
}

function getEstablishLabel(establish: string) {
  if (!establish) return '';
  if (establish.includes('공립(단설)')) return '공립단설';
  if (establish.includes('공립(병설)')) return '공립병설';
  if (establish.includes('사립(법인)')) return '사립법인';
  if (establish.includes('사립(사인)')) return '사립개인';
  return establish;
}

function formatPhone(tel: string) {
  if (!tel) return '';
  return tel.replace(/[^\d-]/g, '');
}

// SVG marker as data URI
function createMarkerImage(kakao: any, isPub: boolean) {
  const color = isPub ? '#2563eb' : '#ea580c';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="13" r="6" fill="white"/>
  </svg>`;
  const encoded = encodeURIComponent(svg);
  return new kakao.maps.MarkerImage(
    `data:image/svg+xml,${encoded}`,
    new kakao.maps.Size(28, 36),
    { offset: new kakao.maps.Point(14, 36) }
  );
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSgg, setSelectedSgg] = useState('');
  const [kindergartens, setKindergartens] = useState<Kindergarten[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Kindergarten | null>(null);
  const [filters, setFilters] = useState<Filters>({
    establish: '전체',
    hasBus: false,
    hasAfterSchool: false,
    hasAvailability: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentSido = regions.find((r) => r.code === selectedSido);

  // Filter kindergartens
  const filtered = kindergartens.filter((k) => {
    if (filters.establish === '공립' && !isPublic(k.establish)) return false;
    if (filters.establish === '사립' && isPublic(k.establish)) return false;
    if (filters.hasBus && !k.hasBus) return false;
    if (filters.hasAfterSchool && !k.hasAfterSchool) return false;
    if (filters.hasAvailability && k.availableSeats <= 0) return false;
    return true;
  });

  const activeFilterCount = [
    filters.establish !== '전체',
    filters.hasBus,
    filters.hasAfterSchool,
    filters.hasAvailability,
  ].filter(Boolean).length;

  // Initialize map
  useEffect(() => {
    if (!kakaoLoaded || !mapRef.current || mapInstanceRef.current) return;
    const kakao = window.kakao;
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 7,
    });
    mapInstanceRef.current = map;
  }, [kakaoLoaded]);

  // Place markers
  const placeMarkers = useCallback(
    (list: Kindergarten[]) => {
      const kakao = window.kakao;
      const map = mapInstanceRef.current;
      if (!kakao || !map) return;

      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      if (list.length === 0) return;

      const bounds = new kakao.maps.LatLngBounds();
      const pubImage = createMarkerImage(kakao, true);
      const privImage = createMarkerImage(kakao, false);

      list.forEach((k) => {
        const pos = new kakao.maps.LatLng(k.lat, k.lng);
        bounds.extend(pos);

        const marker = new kakao.maps.Marker({
          map,
          position: pos,
          image: isPublic(k.establish) ? pubImage : privImage,
          title: k.name,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          setSelected(k);
        });

        markersRef.current.push(marker);
      });

      map.setBounds(bounds);
    },
    []
  );

  useEffect(() => {
    if (kakaoLoaded && mapInstanceRef.current) {
      placeMarkers(filtered);
    }
  }, [filtered, kakaoLoaded, placeMarkers]);

  // Fetch data when region changes
  async function fetchData(sidoCode: string, sggCode: string) {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(
        `/api/kindergarten?sidoCode=${sidoCode}&sggCode=${sggCode}`
      );
      const json = await res.json();
      setKindergartens(json.data || []);
    } catch (e) {
      console.error('Fetch error:', e);
      setKindergartens([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSidoChange(code: string) {
    setSelectedSido(code);
    setSelectedSgg('');
    setKindergartens([]);
    setSelected(null);
  }

  function handleSggChange(code: string) {
    setSelectedSgg(code);
    if (selectedSido && code) {
      fetchData(selectedSido, code);
    }
  }

  const capacityPercent =
    selected && selected.capacity > 0
      ? Math.min(100, Math.round((selected.totalStudents / selected.capacity) * 100))
      : 0;

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
        {/* Top bar */}
        <div className="map-toolbar">
          <div className="map-toolbar-inner">
            <div className="map-toolbar-left">
              <h1 className="map-title">유치원 지도</h1>
              <div className="map-selectors">
                <select
                  className="map-select"
                  value={selectedSido}
                  onChange={(e) => handleSidoChange(e.target.value)}
                >
                  <option value="">시/도 선택</option>
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <select
                  className="map-select"
                  value={selectedSgg}
                  onChange={(e) => handleSggChange(e.target.value)}
                  disabled={!selectedSido}
                >
                  <option value="">시/군/구 선택</option>
                  {currentSido?.sgg.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="map-toolbar-right">
              <button
                className={`map-filter-toggle ${activeFilterCount > 0 ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
              {kindergartens.length > 0 && (
                <span className="map-count">
                  {filtered.length}개
                  {filtered.length !== kindergartens.length && (
                    <span className="map-count-total"> / {kindergartens.length}개</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="map-filter-panel">
              <div className="map-filter-group">
                <label className="map-filter-label">설립 유형</label>
                <div className="map-filter-chips">
                  {(['전체', '공립', '사립'] as EstablishFilter[]).map((v) => (
                    <button
                      key={v}
                      className={`map-chip ${filters.establish === v ? 'map-chip-active' : ''}`}
                      onClick={() => setFilters({ ...filters, establish: v })}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="map-filter-group">
                <label className="map-filter-label">조건</label>
                <div className="map-filter-chips">
                  <button
                    className={`map-chip ${filters.hasBus ? 'map-chip-active' : ''}`}
                    onClick={() => setFilters({ ...filters, hasBus: !filters.hasBus })}
                  >
                    통학차량
                  </button>
                  <button
                    className={`map-chip ${filters.hasAfterSchool ? 'map-chip-active' : ''}`}
                    onClick={() =>
                      setFilters({ ...filters, hasAfterSchool: !filters.hasAfterSchool })
                    }
                  >
                    방과후 과정
                  </button>
                  <button
                    className={`map-chip ${filters.hasAvailability ? 'map-chip-active' : ''}`}
                    onClick={() =>
                      setFilters({ ...filters, hasAvailability: !filters.hasAvailability })
                    }
                  >
                    잔여석 있음
                  </button>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  className="map-filter-reset"
                  onClick={() =>
                    setFilters({
                      establish: '전체',
                      hasBus: false,
                      hasAfterSchool: false,
                      hasAvailability: false,
                    })
                  }
                >
                  필터 초기화
                </button>
              )}
            </div>
          )}
        </div>

        {/* Map + sidebar */}
        <div className="map-body">
          <div className="map-container">
            <div ref={mapRef} className="map-canvas" />
            {loading && (
              <div className="map-loading">
                <div className="map-spinner" />
                <span>유치원 정보를 불러오는 중...</span>
              </div>
            )}
            {!loading && kindergartens.length === 0 && selectedSgg && (
              <div className="map-empty">
                검색 결과가 없습니다
              </div>
            )}
            {!selectedSgg && !loading && (
              <div className="map-empty">
                시/도와 시/군/구를 선택해 주세요
              </div>
            )}
            {/* Legend */}
            <div className="map-legend">
              <span className="map-legend-item">
                <span className="map-legend-dot map-legend-public" />
                공립
              </span>
              <span className="map-legend-item">
                <span className="map-legend-dot map-legend-private" />
                사립
              </span>
            </div>
          </div>

          {/* Detail sidebar */}
          {selected && (
            <aside className="map-sidebar">
              <div className="map-sidebar-header">
                <div>
                  <span
                    className={`map-badge ${isPublic(selected.establish) ? 'map-badge-public' : 'map-badge-private'}`}
                  >
                    {getEstablishLabel(selected.establish)}
                  </span>
                  {selected.rpst_yn === 'Y' && (
                    <span className="map-badge map-badge-closed">휴원</span>
                  )}
                </div>
                <button
                  className="map-sidebar-close"
                  onClick={() => setSelected(null)}
                  aria-label="닫기"
                >
                  &times;
                </button>
              </div>

              <h2 className="map-sidebar-name">{selected.name}</h2>
              <p className="map-sidebar-addr">{selected.addr}</p>

              {/* Contact */}
              <div className="map-sidebar-contact">
                {selected.telno && (
                  <a href={`tel:${formatPhone(selected.telno)}`} className="map-contact-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    {selected.telno}
                  </a>
                )}
                {selected.hpaddr && (
                  <a
                    href={selected.hpaddr.startsWith('http') ? selected.hpaddr : `http://${selected.hpaddr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-contact-link"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    홈페이지
                  </a>
                )}
              </div>

              {/* Operating hours */}
              {selected.opertime && (
                <div className="map-sidebar-section">
                  <h3 className="map-section-title">운영 시간</h3>
                  <p className="map-section-value">{selected.opertime}</p>
                </div>
              )}

              {/* Capacity */}
              <div className="map-sidebar-section">
                <h3 className="map-section-title">원아 현황</h3>
                <div className="map-capacity-bar-wrapper">
                  <div className="map-capacity-header">
                    <span>
                      현원 <strong>{selected.totalStudents}명</strong>
                    </span>
                    <span>
                      정원 <strong>{selected.capacity}명</strong>
                    </span>
                  </div>
                  <div className="map-capacity-bar">
                    <div
                      className="map-capacity-fill"
                      style={{
                        width: `${capacityPercent}%`,
                        backgroundColor:
                          capacityPercent >= 90
                            ? '#dc2626'
                            : capacityPercent >= 70
                              ? '#f59e0b'
                              : '#22c55e',
                      }}
                    />
                  </div>
                  {selected.availableSeats > 0 ? (
                    <span className="map-seats-available">
                      잔여석 {selected.availableSeats}명
                    </span>
                  ) : (
                    <span className="map-seats-full">정원 초과 또는 만석</span>
                  )}
                </div>

                {/* Age breakdown */}
                <div className="map-age-grid">
                  <div className="map-age-item">
                    <span className="map-age-label">만3세</span>
                    <span className="map-age-value">
                      {selected.clcnt3}반 / {selected.ppcnt3}명
                    </span>
                    <span className="map-age-cap">정원 {selected.ag3fpcnt}</span>
                  </div>
                  <div className="map-age-item">
                    <span className="map-age-label">만4세</span>
                    <span className="map-age-value">
                      {selected.clcnt4}반 / {selected.ppcnt4}명
                    </span>
                    <span className="map-age-cap">정원 {selected.ag4fpcnt}</span>
                  </div>
                  <div className="map-age-item">
                    <span className="map-age-label">만5세</span>
                    <span className="map-age-value">
                      {selected.clcnt5}반 / {selected.ppcnt5}명
                    </span>
                    <span className="map-age-cap">정원 {selected.ag5fpcnt}</span>
                  </div>
                  {selected.mixclcnt > 0 && (
                    <div className="map-age-item">
                      <span className="map-age-label">혼합반</span>
                      <span className="map-age-value">
                        {selected.mixclcnt}반 / {selected.mixppcnt}명
                      </span>
                    </div>
                  )}
                  {selected.shclcnt > 0 && (
                    <div className="map-age-item">
                      <span className="map-age-label">특수학급</span>
                      <span className="map-age-value">
                        {selected.shclcnt}반 / {selected.shppcnt}명
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Teachers */}
              <div className="map-sidebar-section">
                <h3 className="map-section-title">교직원 현황</h3>
                <div className="map-info-grid">
                  <div className="map-info-row">
                    <span>교사 수</span>
                    <strong>{selected.totalTeachers}명</strong>
                  </div>
                  <div className="map-info-row">
                    <span>교사 대 원아 비율</span>
                    <strong>
                      1 : {selected.teacherStudentRatio || '-'}
                    </strong>
                  </div>
                  {selected.gnrl_thcnt > 0 && (
                    <div className="map-info-row map-info-sub">
                      <span>일반교사</span>
                      <span>{selected.gnrl_thcnt}명</span>
                    </div>
                  )}
                  {selected.spcn_thcnt > 0 && (
                    <div className="map-info-row map-info-sub">
                      <span>특수교사</span>
                      <span>{selected.spcn_thcnt}명</span>
                    </div>
                  )}
                  {selected.etc_emp_cnt > 0 && (
                    <div className="map-info-row map-info-sub">
                      <span>기타 직원</span>
                      <span>{selected.etc_emp_cnt}명</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bus */}
              <div className="map-sidebar-section">
                <h3 className="map-section-title">통학차량</h3>
                {selected.hasBus ? (
                  <div className="map-info-grid">
                    <div className="map-info-row">
                      <span>운행 여부</span>
                      <span className="map-tag map-tag-yes">운행중</span>
                    </div>
                    <div className="map-info-row">
                      <span>차량 수</span>
                      <strong>{selected.busCount}대</strong>
                    </div>
                  </div>
                ) : (
                  <p className="map-section-empty">통학차량 미운영</p>
                )}
              </div>

              {/* Meal */}
              <div className="map-sidebar-section">
                <h3 className="map-section-title">급식 운영</h3>
                {selected.mealType ? (
                  <div className="map-info-grid">
                    <div className="map-info-row">
                      <span>급식 방식</span>
                      <strong>{selected.mealType}</strong>
                    </div>
                    <div className="map-info-row">
                      <span>영양사</span>
                      <span className={`map-tag ${selected.hasNutritionist ? 'map-tag-yes' : 'map-tag-no'}`}>
                        {selected.hasNutritionist ? '채용' : '미채용'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="map-section-empty">급식 정보 없음</p>
                )}
              </div>

              {/* After school */}
              <div className="map-sidebar-section">
                <h3 className="map-section-title">방과후 과정</h3>
                {selected.hasAfterSchool ? (
                  <div className="map-info-grid">
                    <div className="map-info-row">
                      <span>학급 수</span>
                      <strong>{selected.afterSchoolClasses}반</strong>
                    </div>
                    <div className="map-info-row">
                      <span>참여 원아</span>
                      <strong>{selected.afterSchoolStudents}명</strong>
                    </div>
                    {selected.afterSchoolTime && (
                      <div className="map-info-row">
                        <span>운영 시간</span>
                        <span>{selected.afterSchoolTime}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="map-section-empty">방과후 과정 미운영</p>
                )}
              </div>

              {/* Establishment date */}
              {selected.edate && (
                <div className="map-sidebar-section map-sidebar-footer-info">
                  <span>
                    설립일: {selected.edate.slice(0, 4)}.{selected.edate.slice(4, 6)}.{selected.edate.slice(6, 8)}
                  </span>
                  {selected.rppnname && <span>대표자: {selected.rppnname}</span>}
                </div>
              )}
            </aside>
          )}
        </div>
      </main>
    </>
  );
}
