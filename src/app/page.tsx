import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '우리동네 유치원 | 유치원 알리미 - 2025년어린이집 가장 최신정보',
  description: '처음 유치원을 알아볼 때 헷갈리는 내용을 쉽게 정리합니다. 상담 때 무엇을 물어볼지, 집에서 얼마나 가까워야 하는지, 비용과 방과후 과정은 어디까지 확인해야 하는지 하나씩 알려드립니다. 선생님, 학급 인원, 안전, 급식처럼 상담 자리에서 확인할 질문을 모았습니다. 집에서의 거리, 차량 이용 시간, 도보 안전, 하원 시간을 함께 살펴봅니다. 활동이 많은 아이, 낯가림이 있는 아이처럼 성향에 맞는 환경을 봅니다.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <main>
      <Container className="hero-grid">
        <section className="hero-copy" aria-labelledby="home-title">
          <p className="eyebrow">유치원 알아보기</p>
          <h1 id="home-title">우리 아이 유치원, 무엇부터 봐야 할까요?</h1>
          <p>
            처음 유치원을 알아볼 때 헷갈리는 내용을 쉽게 정리합니다. 상담 때 무엇을
            물어볼지, 집에서 얼마나 가까워야 하는지, 비용과 방과후 과정은 어디까지
            확인해야 하는지 하나씩 알려드립니다.
          </p>
          <div className="hero-note" aria-label="콘텐츠 방향">
            <span>상담 질문</span>
            <span>통학 거리</span>
            <span>비용과 일정</span>
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
          <strong>상담 때 물어볼 것</strong>
          <p>선생님, 학급 인원, 안전, 급식처럼 상담 자리에서 확인할 질문을 모았습니다.</p>
        </div>
        <div>
          <span className="care-index">02</span>
          <strong>매일 다니기 괜찮은지</strong>
          <p>집에서의 거리, 차량 이용 시간, 도보 안전, 하원 시간을 함께 살펴봅니다.</p>
        </div>
        <div>
          <span className="care-index">03</span>
          <strong>아이에게 맞는 곳인지</strong>
          <p>활동이 많은 아이, 낯가림이 있는 아이처럼 성향에 맞는 환경을 봅니다.</p>
        </div>
      </Container>

      <Container className="landing-info">
        <p className="eyebrow">읽을거리</p>
        <h2>유치원 고르기 전에 많이 묻는 질문부터 다룹니다</h2>
        <p>
          “좋다는 유치원이 우리 아이에게도 맞을까?”, “집에서 조금 멀어도 괜찮을까?”,
          “상담에 가면 뭘 물어봐야 할까?” 같은 질문을 글로 풀어갑니다.
        </p>
      </Container>

      <Container className="landing-cta">
        <p className="eyebrow">블로그</p>
        <h2>지금은 유치원 선택 글을 먼저 모으고 있습니다</h2>
        <p>
          상담 체크리스트, 통학 거리, 국공립과 사립의 차이, 아이 성향별 유치원 고르는
          법부터 읽어볼 수 있습니다.
        </p>
        <Button href="/blog">블로그 글 보기</Button>
      </Container>
    </main>
  );
}
