import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <main>
      <Container className="not-found">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 아직 발행되지 않은 글입니다.</p>
        <Link className="button button-primary" href="/">
          홈으로 돌아가기
        </Link>
      </Container>
    </main>
  );
}
