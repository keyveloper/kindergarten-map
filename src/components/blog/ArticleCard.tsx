import Link from 'next/link';
import { BlogPost } from '@/data/posts';

interface ArticleCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function ArticleCard({ post, featured = false }: ArticleCardProps) {
  return (
    <article className={`article-card ${featured ? 'article-card-featured' : ''}`}>
      {featured ? <p className="eyebrow">추천 글</p> : null}
      <div className="article-meta">
        <span>{post.category}</span>
        <span>{post.readingMinutes}분 읽기</span>
      </div>
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <Link className="text-link" href={`/blog/${post.slug}`}>
        글 읽기
      </Link>
    </article>
  );
}
