import { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '유치원 지도',
  description:
    '지역, 거리, 통학차량, 방과후 과정, 빈자리 기준으로 우리 동네 유치원 정보를 비교하는 지도입니다.',
  alternates: {
    canonical: '/map',
  },
  openGraph: {
    title: `유치원 지도 | ${siteConfig.name}`,
    description:
      '우리 동네 유치원을 지도에서 찾고 거리, 빈자리, 통학차량, 방과후 정보를 비교해 보세요.',
    url: `${siteConfig.url}/map`,
    type: 'website',
    images: ['/images/kindergarten-map-hero.png'],
  },
};

export default function MapLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
