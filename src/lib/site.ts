export const siteConfig = {
  name: '우리동네 유치원',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kindergartenmap.com',
  description:
    '한국 부모를 위한 유치원 선택, 입학 준비, 통학 동선 정보를 정리하는 블로그입니다.',
  navigation: [
    { href: '/', label: '홈' },
    { href: '/map', label: '지도' },
    { href: '/blog', label: '블로그' },
  ],
};
