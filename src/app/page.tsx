import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

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
      <Container className="hero-grid">
        <section className="hero-copy" aria-labelledby="home-title">
          <h1 id="home-title">
            우리 동네 유치원,
            <br />
            지도에서 찾고 나란히 비교하세요
          </h1>
          <p>
            동네 이름이나 주소를 검색하면 주변 유치원을 거리순으로 보여드립니다. 교사
            1인당 원아 수, 연령별 빈자리, 급식과 통학차량, 방과후 과정을 한 화면에
            놓고 비교해 우리 아이에게 맞는 곳을 고르세요.
          </p>
          <div className="hero-actions">
            <Button href="/map">지도에서 유치원 찾기</Button>
            <Button href="/blog" variant="secondary">
              유치원 고르기 가이드
            </Button>
          </div>
          <p className="hero-trust">
            교육부 유치원알리미 공식 데이터로 만들었고, 이용료는 없습니다.
          </p>
        </section>

        <div className="hero-preview" role="img" aria-label="지도 목록 화면 예시: 검색한 동네 주변 유치원이 거리순으로 나오고, 유치원마다 교사 대 원아 수와 연령별 잔여석, 통학차량 여부가 표시됩니다.">
          <div className="hp-bar" aria-hidden="true">
            <span className="hp-search">역삼동</span>
            <span className="hp-search-go">검색</span>
          </div>
          <ul className="hp-list" aria-hidden="true">
            <li>
              <div className="hp-top">
                <span className="hp-name">햇살유치원</span>
                <span className="hp-dist">320m</span>
              </div>
              <div className="hp-tags">
                <span>교사 1 : 11</span>
                <span>만 4세 잔여 2</span>
                <span>통학차량</span>
              </div>
            </li>
            <li>
              <div className="hp-top">
                <span className="hp-name">가온누리유치원</span>
                <span className="hp-dist">540m</span>
              </div>
              <div className="hp-tags">
                <span>교사 1 : 14</span>
                <span>만 4세 잔여 0</span>
                <span>방과후</span>
              </div>
            </li>
            <li>
              <div className="hp-top">
                <span className="hp-name">푸른숲유치원</span>
                <span className="hp-dist">760m</span>
              </div>
              <div className="hp-tags">
                <span>교사 1 : 9</span>
                <span>만 4세 잔여 3</span>
                <span>급식 직영</span>
              </div>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="home-body">
        <section className="home-list-block" aria-labelledby="how-title">
          <h2 id="how-title">지도에서 이렇게 비교합니다</h2>
          <dl className="home-list">
            <div className="home-list-item">
              <dt>거리순으로 정렬</dt>
              <dd>
                내 위치를 누르거나 동네·주소·건물명을 검색하면 가까운 유치원부터
                차례로 보여드립니다.
              </dd>
            </div>
            <div className="home-list-item">
              <dt>같은 기준으로 나란히</dt>
              <dd>
                마음에 드는 곳을 담아 교사 1인당 원아 수, 급식 운영, 통학차량,
                방과후 과정을 한 화면에서 비교합니다.
              </dd>
            </div>
            <div className="home-list-item">
              <dt>우리 아이 나이에 맞춰</dt>
              <dd>
                아이 나이로 결과를 걸러 그 연령의 반과 남은 자리를 확인하고 맞는
                곳을 고릅니다.
              </dd>
            </div>
          </dl>
        </section>

        <section className="home-trust" aria-labelledby="trust-title">
          <h2 id="trust-title">홍보 없이, 공식 데이터로만</h2>
          <p>
            모든 유치원을 교육부 유치원알리미 공식 데이터로 같은 기준에 놓고
            보여드립니다. 특정 기관을 위에 올리거나 광고로 끼워 넣지 않습니다. 지금은
            서울 전체 구와 6대 광역시, 세종, 경기, 제주 등 일부 지역을 지원하며 대상
            지역을 넓혀가고 있습니다.
          </p>
        </section>

        <section className="home-blog" aria-labelledby="blog-title">
          <h2 id="blog-title">유치원 고르기 전에 읽어두면 좋은 글</h2>
          <p>
            상담에서 물어볼 것, 국공립과 사립의 차이, 통학 거리를 판단하는 법, 아이
            성향별로 보는 기준을 정리했습니다.
          </p>
          <Button href="/blog" variant="secondary">
            블로그 글 보기
          </Button>
        </section>
      </Container>
    </main>
  );
}
