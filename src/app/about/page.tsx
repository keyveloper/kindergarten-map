import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '소개',
  description: '우리동네 유치원이 제공하는 정보의 범위와 콘텐츠 작성 기준을 안내합니다.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main>
      <Container className="static-page">
        <p className="eyebrow">About</p>
        <h1>우리동네 유치원 소개</h1>
        <p>
          우리동네 유치원은 유치원 선택과 입학 준비에 필요한 정보를 정리하는 블로그입니다.
          상담에서 무엇을 확인해야 하는지, 통학 거리는 어떻게 판단해야 하는지, 아이
          성향에 따라 어떤 환경을 살펴봐야 하는지 같은 주제를 다룹니다.
        </p>
        <p>
          유치원을 고르는 과정에서는 많은 정보가 한꺼번에 들어옵니다. 시설 사진, 주변
          후기, 프로그램 설명, 모집 일정, 비용 안내가 섞이다 보면 실제로 비교해야 할
          기준이 흐려질 수 있습니다. 이 사이트는 부모가 직접 확인할 수 있는 항목을 중심으로
          글을 작성합니다.
        </p>
        <section>
          <h2>다루는 내용</h2>
          <p>
            현재는 상담 체크리스트, 통학 동선, 국공립과 사립의 차이, 아이 성향별 선택
            기준을 중심으로 글을 발행합니다. 이후에는 지역별 유치원 정보, 모집 일정,
            비교 도구처럼 실제 선택 과정에 필요한 기능을 단계적으로 추가할 계획입니다.
          </p>
        </section>
        <section>
          <h2>작성 기준</h2>
          <p>
            콘텐츠는 특정 기관을 홍보하기보다 부모가 질문을 만들고 판단 기준을 세우는 데
            초점을 둡니다. 단정적인 표현은 줄이고, 확인해야 할 항목과 주의할 점을 구분해
            설명합니다. 실제 결정 전에는 각 유치원의 공식 안내와 상담 내용을 함께 확인하는
            것을 권합니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
