import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div>
          <Link href="/" className="brand footer-brand" aria-label="유치원맵 노트 홈">
            <BrandMark />
            <span>{siteConfig.name}</span>
          </Link>
          <p>
            유치원 선택과 입학 준비를 차분하게 정리하는 한국어 정보 블로그입니다.
          </p>
        </div>
        <nav aria-label="하단 메뉴">
          <Link href="/">홈</Link>
          <Link href="/blog">블로그</Link>
          <Link href="/about">소개</Link>
          <Link href="/terms">이용약관</Link>
        </nav>
      </Container>
    </footer>
  );
}
