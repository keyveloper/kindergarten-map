import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'iF1WE4Iq7OivIIHk0PZ5_klWCTX3vRBJc4iVOuLGxj8',
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: 'website',
    locale: 'ko_KR',
    images: ['/images/kindergarten-map-hero.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <ScrollProgress />
        {children}
        <Footer />
      </body>
    </html>
  );
}
