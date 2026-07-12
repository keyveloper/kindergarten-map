import { Metadata } from 'next';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { Container } from '@/components/ui/Container';
import { publishedPosts as blogPosts } from '@/data/posts';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '블로그',
  description:
    '유치원 선택, 설명회 질문, 입학 준비, 통학 거리, 아이 성향별 체크포인트를 정리한 한국어 블로그 글 목록입니다.',
  keywords: ['유치원 선택', '유치원 입학 준비', '유치원 설명회', '유치원 상담 질문', '유치원 블로그'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `블로그 | ${siteConfig.name}`,
    description:
      '유치원 선택과 입학 준비에 필요한 상담 질문, 생활 습관, 통학 거리 정보를 한곳에 모았습니다.',
    url: `${siteConfig.url}/blog`,
    type: 'website',
    images: ['/images/chibi-kindergarten-guide.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `블로그 | ${siteConfig.name}`,
    description:
      '유치원 선택과 입학 준비에 필요한 상담 질문, 생활 습관, 통학 거리 정보를 한곳에 모았습니다.',
    images: ['/images/chibi-kindergarten-guide.webp'],
  },
};

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPosts;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} 블로그`,
    description: metadata.description,
    url: `${siteConfig.url}/blog`,
    inLanguage: 'ko-KR',
    blogPost: blogPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      keywords: post.tags.join(', '),
    })),
  };

  return (
    <main>
      <Container className="blog-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="blog-page-heading">
          <p className="eyebrow">Parent guide</p>
          <h1>부모를 위한 유치원 가이드</h1>
          <p>
            복잡한 유치원 선택 앞에서 조금 덜 막막하도록, 상담 질문부터 입학 준비와
            통학 기준까지 실제로 확인할 내용을 차근차근 정리했습니다.
          </p>
        </div>
        <div className="article-layout">
          <ArticleCard post={featuredPost} featured />
          <div className="article-stack">
            {otherPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
