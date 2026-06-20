import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function HomePage() {
  return (
    <main>
      <Container className="hero-grid">
        <section className="hero-copy" aria-labelledby="home-title">
          <p className="eyebrow">엄마의 유치원 선택 노트</p>
          <h1 id="home-title">우리 동네 유치원 선택을 더 다정하게 정리하는 블로그</h1>
          <p>
            상담 전 체크리스트, 통학 동선, 방과후 과정처럼 엄마들이 실제로 궁금해하는
            정보를 먼저 쌓고, 이후에는 지역별 유치원 맵과 비교 도구로 확장합니다.
          </p>
          <div className="hero-note" aria-label="콘텐츠 방향">
            <span>상담 전 질문</span>
            <span>통학 거리</span>
            <span>아이 성향</span>
          </div>
          <div className="hero-actions">
            <Button href="/blog">블로그 글 보기</Button>
          </div>
        </section>
        <div className="hero-media">
          <Image
            src="/images/kindergarten-map-hero.png"
            alt="태블릿에서 동네 유치원 지도를 확인하는 부모의 일러스트"
            width={1200}
            height={800}
            priority
            sizes="(max-width: 768px) 100vw, 46vw"
          />
        </div>
      </Container>

      <Container className="care-strip" aria-label="사이트 콘텐츠 핵심 가치">
        <div>
          <span className="care-index">01</span>
          <strong>엄마 눈높이</strong>
          <p>광고 문구보다 실제 상담에서 확인할 질문을 먼저 정리합니다.</p>
        </div>
        <div>
          <span className="care-index">02</span>
          <strong>동네 기준</strong>
          <p>지도와 생활권을 함께 보며 매일의 등하원 부담을 줄입니다.</p>
        </div>
        <div>
          <span className="care-index">03</span>
          <strong>아이 중심</strong>
          <p>프로그램 수보다 아이의 적응과 하루 리듬을 기준으로 봅니다.</p>
        </div>
      </Container>

      <Container className="landing-info">
        <p className="eyebrow">Information</p>
        <h2>유치원 선택이 막막한 부모를 위한 기준 정리</h2>
        <p>
          유치원 상담에서 무엇을 물어봐야 하는지, 통학 동선은 어떻게 봐야 하는지,
          아이 성향에 맞는 환경은 무엇인지 차분하게 정리합니다. 광고성 소개보다
          부모가 직접 비교하고 판단할 수 있는 기준을 남기는 것이 목표입니다.
        </p>
      </Container>

      <Container className="landing-cta">
        <p className="eyebrow">Blog</p>
        <h2>실제로 써먹을 수 있는 글부터 읽어보세요</h2>
        <p>
          입학 준비, 상담 체크리스트, 통학 거리, 방과후 과정처럼 바로 확인할 수 있는
          주제부터 하나씩 쌓고 있습니다.
        </p>
        <Button href="/blog">블로그 글 보기</Button>
      </Container>
    </main>
  );
}
