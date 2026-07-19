import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { GameIcon } from '@/components/ui/GameIcon';

export const metadata: Metadata = {
  title: '우리 동네 유치원 지도 - 주변 유치원 찾고 나란히 비교',
  description:
    '동네 이름이나 주소로 주변 유치원을 거리순으로 찾고, 교사 1인당 원아 수·연령별 잔여석·급식·통학차량·방과후 과정을 나란히 비교하세요. 교육부 유치원알리미 공식 데이터로 만든 무료 지도 서비스입니다.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <main className="home">
      <section className="forest-hero" aria-labelledby="home-title">
        <Image
          className="forest-hero-art"
          src="/images/kindergarten-forest-field-v2.webp"
          alt="울창한 숲길을 함께 걷는 부모와 아이 일러스트"
          fill
          priority
          sizes="100vw"
        />
        <Container className="forest-hero-inner">
          <div className="quest-dialog hero-copy">
            <p className="hero-kicker"><GameIcon name="compass" size={18} /> 우리 동네 유치원 찾기</p>
            <h1 id="home-title">
              우리 동네 유치원,
              <br />
              <span>유치원 지도</span>에서 찾아보세요
            </h1>
            <p>
              주소를 검색하면 가까운 유치원부터 보여드려요. 빈자리, 교사 수, 급식과
              통학차량까지 한 화면에서 비교해 보세요.
            </p>
            <div className="hero-actions">
              <Button href="/map"><GameIcon name="map" /> 유치원 지도 보기</Button>
              <Button href="/blog" variant="secondary">
                <GameIcon name="book" /> 유치원 선택 가이드
              </Button>
            </div>
            <div className="hero-trust" aria-label="서비스 신뢰 정보">
              <GameIcon name="shield" size={18} />
              <span>교육부 유치원알리미 공식 데이터 · 무료 이용</span>
            </div>
          </div>
          <div className="forest-mini-map" aria-hidden="true">
            <span><GameIcon name="pin" size={15} /> 우리 동네</span>
            <strong>가까운 유치원 320m</strong>
          </div>
          <div className="forest-nameplate" aria-hidden="true">우리동네 유치원</div>
        </Container>
      </section>

      <Container className="home-body">
        <section className="home-list-block quest-board" aria-labelledby="how-title">
          <div className="section-title-row">
            <span className="section-medallion"><GameIcon name="scroll" /></span>
            <div>
              <p className="section-kicker">이용 방법</p>
              <h2 id="how-title">세 단계면 후보가 선명해져요</h2>
            </div>
          </div>
          <dl className="home-list">
            <div className="home-list-item">
              <dt><span>1</span> 출발지를 정해요</dt>
              <dd>
                내 위치를 누르거나 동네·주소·건물명을 검색하면 가까운 유치원부터
                차례로 보여드립니다.
              </dd>
            </div>
            <div className="home-list-item">
              <dt><span>2</span> 후보를 지도에 담아요</dt>
              <dd>
                마음에 드는 곳을 담아 교사 1인당 원아 수, 급식 운영, 통학차량,
                방과후 과정을 한 화면에서 비교합니다.
              </dd>
            </div>
            <div className="home-list-item">
              <dt><span>3</span> 조건을 나란히 봐요</dt>
              <dd>
                아이 나이로 결과를 걸러 그 연령의 반과 남은 자리를 확인하고 맞는
                곳을 고릅니다.
              </dd>
            </div>
          </dl>
        </section>

        <section className="home-trust field-guide" aria-labelledby="trust-title">
          <div className="section-title-row">
            <span className="section-medallion section-medallion-blue"><GameIcon name="shield" /></span>
            <div>
              <p className="section-kicker">정보 출처</p>
              <h2 id="trust-title">홍보 없이, 공식 데이터로만</h2>
            </div>
          </div>
          <p>
            모든 유치원을 교육부 유치원알리미 공식 데이터로 같은 기준에 놓고
            보여드립니다. 특정 기관을 위에 올리거나 광고로 끼워 넣지 않습니다. 지금은
            서울 전체 구와 6대 광역시, 세종, 경기, 제주 등 일부 지역을 지원하며 대상
            지역을 넓혀가고 있습니다.
          </p>
        </section>

        <section className="home-blog adventure-note" aria-labelledby="blog-title">
          <div className="section-title-row">
            <span className="section-medallion section-medallion-coral"><GameIcon name="book" /></span>
            <div>
              <p className="section-kicker">유치원 선택 가이드</p>
              <h2 id="blog-title">유치원 고르기 전에 읽어두면 좋은 글</h2>
            </div>
          </div>
          <p>
            상담에서 물어볼 것, 국공립과 사립의 차이, 통학 거리를 판단하는 법, 아이
            성향별로 보는 기준을 정리했습니다.
          </p>
          <Button href="/blog" variant="secondary">
            <GameIcon name="book" /> 가이드 모아보기
          </Button>
        </section>
      </Container>
    </main>
  );
}
