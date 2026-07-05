export const siteConfig = {
  name: '우리동네 유치원',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindergartenmap.com',
  description:
    '우리 동네 유치원을 지도에서 찾아 교사 1인당 원아 수, 연령별 잔여석, 급식, 통학차량까지 나란히 비교하는 서비스입니다. 교육부 유치원알리미 공식 데이터로 만들었습니다.',
  navigation: [
    { href: '/', label: '홈' },
    { href: '/map', label: '지도' },
    { href: '/blog', label: '블로그' },
  ],
};
