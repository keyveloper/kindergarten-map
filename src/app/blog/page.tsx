import { Metadata } from 'next';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { Container } from '@/components/ui/Container';
import { blogPosts } from '@/data/posts';

export const metadata: Metadata = {
  title: '블로그',
  description: '유치원 선택과 입학 준비에 필요한 한국어 정보성 글을 모아둔 블로그입니다.',
};

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <main>
      <Container className="blog-page">
        <div className="blog-page-heading">
          <p className="eyebrow">Blog</p>
          <h1>블로그</h1>
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
