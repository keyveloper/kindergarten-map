import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/data/posts';

interface ArticleCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function ArticleCard({ post, featured = false }: ArticleCardProps) {
  return (
    <article className={`article-card ${featured ? 'article-card-featured' : ''}`}>
      <Link className="article-card-image" href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
        <Image
          src={`/images/posts/${post.slug}-1.webp`}
          alt=""
          width={1200}
          height={800}
          sizes={featured ? '(max-width: 860px) 100vw, 540px' : '(max-width: 560px) 100vw, (max-width: 960px) 50vw, 360px'}
        />
      </Link>
      <div className="article-card-content">
        <div className="article-card-badges">
          {featured ? <span className="article-recommend-badge">추천</span> : null}
          <span className="article-category-badge">{post.category}</span>
        </div>
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.description}</p>
        <div className="article-card-footer">
          <div className="article-meta">
            <time dateTime={post.publishedAt}>{post.publishedAt.replaceAll('-', '. ')}</time>
            <span>{post.readingMinutes}분 읽기</span>
          </div>
          <Link className="text-link" href={`/blog/${post.slug}`} aria-label={`${post.title} 읽기`}>
            읽어보기
          </Link>
        </div>
      </div>
    </article>
  );
}
