import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '이용약관',
  description: '우리동네 유치원 웹사이트 이용 조건, 콘텐츠 이용 범위, 정보의 한계를 안내합니다.',
};

export default function TermsPage() {
  return (
    <main>
      <Container className="static-page">
        <p className="eyebrow">Terms</p>
        <h1>이용약관</h1>
        <section>
          <h2>목적</h2>
          <p>
            본 약관은 우리동네 유치원 웹사이트의 이용 조건과 콘텐츠 이용 범위를 안내하기
            위한 문서입니다. 사용자는 사이트를 이용함으로써 본 약관의 내용을 확인한 것으로
            봅니다.
          </p>
        </section>
        <section>
          <h2>서비스의 범위</h2>
          <p>
            우리동네 유치원는 유치원 선택, 입학 준비, 상담 질문, 통학 동선, 아이 성향에 관한
            정보성 콘텐츠를 제공합니다. 사이트에 게시된 글은 부모가 비교 기준을 세우는 데
            참고할 수 있도록 작성되며, 특정 유치원의 입학 가능 여부나 운영 조건을 보장하지
            않습니다.
          </p>
        </section>
        <section>
          <h2>정보의 확인</h2>
          <p>
            유치원의 모집 일정, 비용, 차량 운행, 방과후 과정, 교사 구성, 시설 운영 방식은
            시기와 기관 사정에 따라 달라질 수 있습니다. 중요한 결정을 하기 전에는 해당
            유치원, 교육청, 공식 모집 시스템의 최신 안내를 직접 확인해야 합니다.
          </p>
        </section>
        <section>
          <h2>콘텐츠 권리</h2>
          <p>
            사이트에 게시된 글, 이미지, 디자인 요소의 권리는 우리동네 유치원 또는 정당한 권리자에게
            있습니다. 개인적인 열람과 참고 목적을 넘어서 무단 복제, 수정, 배포, 상업적 이용을
            할 수 없습니다.
          </p>
        </section>
        <section>
          <h2>이용자의 책임</h2>
          <p>
            사용자는 사이트의 콘텐츠를 자신의 상황에 맞게 판단해 이용해야 합니다. 사이트에
            게시된 정보를 근거로 한 선택의 최종 책임은 사용자에게 있으며, 필요한 경우 기관
            상담이나 공식 자료 확인을 병행해야 합니다.
          </p>
        </section>
        <section>
          <h2>약관 변경</h2>
          <p>
            본 약관은 서비스 운영 상황에 따라 변경될 수 있습니다. 변경된 내용은 이 페이지에
            게시하며, 게시된 시점부터 적용됩니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
