import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { BlogContentBlock, blogPosts } from '@/data/posts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <main>
      <article>
        <section className="post-hero">
          <Container className="post-hero-inner">
            <p className="post-breadcrumb">홈 &gt; 블로그 &gt; {post.category}</p>
            <h1>{post.title}</h1>
            <p className="post-description">{post.description}</p>
            <div className="post-meta-line">
              <span>{post.publishedAt}</span>
              <span>읽는시간 {post.readingMinutes}분</span>
            </div>
          </Container>
        </section>

        <Container className="post-container">
          <div className="post-article">
            <section className="post-summary-card" aria-labelledby="summary-title">
              <h2 id="summary-title">3줄 요약</h2>
              {post.summary.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>

            {post.content.map((block, index) => renderContentBlock(block, index))}

            <section className="post-tags" aria-label="태그">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </section>

            <section className="post-related">
              <h2>더 알아보면 좋은 글</h2>
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  {relatedPost.title}
                  <span>{relatedPost.category}</span>
                </Link>
              ))}
            </section>
          </div>
        </Container>
      </article>
    </main>
  );
}

function renderContentBlock(block: BlogContentBlock, index: number) {
  const key = `${block.type}-${index}`;

  switch (block.type) {
    case 'h2':
      return (
        <div className="post-heading-block" key={key}>
          {block.eyebrow ? <p className="post-section-eyebrow">{block.eyebrow}</p> : null}
          <h2>{block.text}</h2>
        </div>
      );
    case 'h3':
      return (
        <h3 className="post-subheading" key={key}>
          {block.text}
        </h3>
      );
    case 'p':
      return <p key={key}>{block.text}</p>;
    case 'note':
      return (
        <aside className="post-note" key={key}>
          <h3>{block.title}</h3>
          {block.body.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </aside>
      );
    case 'image':
      return (
        <figure className="post-image" key={key}>
          <Image src={block.src} alt={block.alt} width={1200} height={675} sizes="(max-width: 768px) 100vw, 820px" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
  }
}
