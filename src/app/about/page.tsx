import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '소개',
  description: '유치원맵 노트가 어떤 기준으로 유치원 선택 정보를 정리하는지 소개합니다.',
};

export default function AboutPage() {
  return (
    <main>
      <Container className="static-page">
        <p className="eyebrow">About</p>
        <h1>유치원맵 노트 소개</h1>
        <p>
          유치원맵 노트는 유치원 선택과 입학 준비를 앞둔 부모를 위해 상담 질문,
          통학 동선, 아이 성향, 방과후 과정 같은 정보를 차분하게 정리하는 블로그입니다.
        </p>
        <p>
          광고성 문구보다 부모가 직접 비교하고 판단할 수 있는 기준을 남기는 것을 목표로
          합니다. 처음 유치원을 알아보는 부모도 글을 읽고 바로 체크리스트를 만들 수 있도록
          실용적인 관점으로 콘텐츠를 발행합니다.
        </p>
      </Container>
    </main>
  );
}
