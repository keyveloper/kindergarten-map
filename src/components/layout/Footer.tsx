'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/brand/BrandMark';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/lib/site';

export function Footer() {
  const pathname = usePathname();
  // 지도는 전체 화면 앱처럼 동작하므로 푸터를 숨겨 외부 스크롤을 없앤다
  if (pathname === '/map') return null;
  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div>
          <Link href="/" className="brand footer-brand" aria-label="우리동네 유치원 홈">
            <BrandMark />
            <span>{siteConfig.name}</span>
          </Link>
          <p>
            동네 유치원을 지도에서 찾아 나란히 비교하고, 우리 아이에게 맞는 곳을 고르도록 돕습니다.
          </p>
        </div>
        <nav aria-label="하단 메뉴">
          <Link href="/">홈</Link>
          <Link href="/blog">블로그</Link>
          <Link href="/about">소개</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/terms">이용약관</Link>
        </nav>
      </Container>
    </footer>
  );
}
