import { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description:
    '우리동네 유치원이 방문 과정에서 자동으로 수집하는 정보, 쿠키와 광고 사용, 개인정보 취급 방식과 이용자 권리를 안내합니다.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main>
      <Container className="static-page">
        <p className="eyebrow">Privacy</p>
        <h1>개인정보처리방침</h1>
        <section>
          <h2>수집하는 정보</h2>
          <p>
            우리동네 유치원은 회원가입 절차를 두지 않으며, 이름이나 연락처처럼
            이용자가 직접 입력하는 개인정보를 받지 않습니다. 사이트를 방문할 때
            자동으로 남는 정보만 다루며, 여기에는 쿠키, 접속 로그, 브라우저와 기기
            정보, IP 주소가 포함됩니다. 이 정보는 사이트를 안정적으로 운영하고
            문제를 확인하는 목적으로만 사용합니다.
          </p>
        </section>
        <section>
          <h2>쿠키 및 광고</h2>
          <p>
            우리동네 유치원은 Google AdSense를 통해 광고를 게재합니다. Google을
            비롯한 제3자 광고 사업자는 쿠키를 사용해 이용자가 이 사이트와 다른
            사이트를 방문한 기록을 바탕으로 맞춤형 광고를 제공할 수 있습니다.
            이용자는 Google 광고 설정
            (https://www.google.com/settings/ads)에서 맞춤형 광고 사용을 끌 수
            있으며, 사용하는 브라우저의 설정을 통해 쿠키 저장을 차단하거나 삭제할
            수도 있습니다. 쿠키를 차단하면 일부 기능의 동작 방식이 달라질 수
            있습니다.
          </p>
        </section>
        <section>
          <h2>분석 도구</h2>
          <p>
            방문 추이와 인기 있는 콘텐츠를 파악하기 위해 익명화된 통계 도구를
            사용할 수 있습니다. 이 과정에서 수집되는 정보는 특정 개인을 식별하는
            형태가 아니라 전체 방문 흐름을 파악하기 위한 통계 자료로 처리됩니다.
          </p>
        </section>
        <section>
          <h2>제3자 제공</h2>
          <p>
            우리동네 유치원은 이용자의 정보를 외부에 판매하지 않으며, 법령에 따라
            요구되는 경우를 제외하고 제3자에게 제공하지 않습니다. 광고와 통계에
            사용되는 쿠키 정보는 위에 안내한 목적과 사업자의 범위 안에서만
            처리됩니다.
          </p>
        </section>
        <section>
          <h2>이용자 권리 및 문의</h2>
          <p>
            이용자는 브라우저 설정을 통해 쿠키 사용을 직접 관리할 수 있으며, 개인정보
            처리와 관련해 궁금한 점이 있으면 언제든 문의할 수 있습니다. 문의는
            contact@kindergartenmap.com 으로 보내 주시면 확인 후 답변드립니다.
          </p>
        </section>
        <section>
          <h2>방침 변경</h2>
          <p>
            본 방침은 서비스 운영 상황이나 관련 법령에 따라 변경될 수 있습니다.
            변경된 내용은 이 페이지에 게시하며, 게시된 시점부터 적용됩니다.
          </p>
        </section>
      </Container>
    </main>
  );
}
