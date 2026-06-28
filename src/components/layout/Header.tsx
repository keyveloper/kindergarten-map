import Link from 'next/link';
import { BrandMark } from '@/components/brand/BrandMark';
import { siteConfig } from '@/lib/site';
import { Container } from '@/components/ui/Container';

export function Header() {
  return (
    <header className="site-header">
      <Container className="header-inner">
        <Link href="/" className="brand" aria-label="우리동네 유치원 홈">
          <BrandMark />
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="primary-nav" aria-label="주요 메뉴">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
