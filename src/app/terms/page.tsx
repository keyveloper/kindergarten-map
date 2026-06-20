import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '이용약관',
  description: '유치원맵 노트 웹사이트 이용약관입니다.',
};

export default function TermsPage() {
  return (
    <main>
      <Container className="static-page">
        <p className="eyebrow">Terms</p>
        <h1>이용약관</h1>
        <section>
          <h2>서비스 이용</h2>
          <p>
            유치원맵 노트는 유치원 선택과 입학 준비에 도움이 되는 정보성 콘텐츠를 제공합니다.
            사용자는 본 사이트의 콘텐츠를 개인적인 정보 확인 목적으로 이용할 수 있습니다.
          </p>
        </section>
        <section>
          <h2>정보의 한계</h2>
          <p>
            사이트에 게시된 내용은 일반적인 정보 제공을 목적으로 하며, 각 유치원의 실제 운영
            기준이나 모집 일정은 변경될 수 있습니다. 중요한 결정 전에는 해당 기관의 공식 안내를
            함께 확인해야 합니다.
          </p>
        </section>
        <section>
          <h2>콘텐츠 권리</h2>
          <p>
            사이트의 글, 이미지, 디자인 요소는 별도 허가 없이 무단 복제하거나 재배포할 수 없습니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
