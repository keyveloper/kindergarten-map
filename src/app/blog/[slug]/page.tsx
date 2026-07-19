import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { Container } from '@/components/ui/Container';
import { BlogContentBlock, publishedPosts as blogPosts } from '@/data/posts';
import { siteConfig } from '@/lib/site';
import { GameIcon } from '@/components/ui/GameIcon';

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
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      tags: post.tags,
      images: [`/images/posts/${post.slug}-1.webp`],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`/images/posts/${post.slug}-1.webp`],
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
  const secondIllustrationIndex = post.content.findIndex(
    (block, index) => index >= post.content.length / 2 && block.type === 'h2',
  );
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      url: postUrl,
      image: [
        `${siteConfig.url}/images/posts/${post.slug}-1.webp`,
        `${siteConfig.url}/images/posts/${post.slug}-2.webp`,
      ],
      inLanguage: 'ko-KR',
      keywords: post.tags.join(', '),
      author: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/images/brand-mark.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': postUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: siteConfig.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '블로그',
          item: `${siteConfig.url}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: postUrl,
        },
      ],
    },
  ];

  return (
    <main>
      <article>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="post-hero">
          <Container className="post-hero-inner">
            <p className="post-breadcrumb"><GameIcon name="book" size={16} /> 유치원 선택 가이드 · {post.category}</p>
            <h1>{post.title}</h1>
            <p className="post-description">{post.description}</p>
            <div className="post-meta-line">
              <span>{post.publishedAt}</span>
              <span>약 {post.readingMinutes}분이면 읽어요</span>
            </div>
          </Container>
        </section>

        <Container className="post-container">
          <div className="post-article">
            <section className="post-summary-card" aria-labelledby="summary-title">
              <h2 id="summary-title"><GameIcon name="scroll" /> 이 글에서 확인할 내용</h2>
              {post.summary.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </section>

            <PostIllustration
              slug={post.slug}
              index={1}
              alt={`${post.title}의 핵심 내용을 보여주는 유치원 생활 일러스트`}
              caption="장면 1 · 부모와 아이의 하루에서 먼저 살펴볼 부분"
              priority
            />

            {post.content.map((block, index) => (
              <Fragment key={`${block.type}-${index}`}>
                {index === secondIllustrationIndex ? (
                  <PostIllustration
                    slug={post.slug}
                    index={2}
                    alt={`${post.title}의 선택 기준을 보여주는 유치원 생활 일러스트`}
                    caption="장면 2 · 조건을 하나씩 비교해 선택을 좁히는 과정"
                  />
                ) : null}
                {renderContentBlock(block, index)}
              </Fragment>
            ))}

            <section className="post-tags" aria-label="태그">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </section>

            <section className="post-related">
              <h2><GameIcon name="compass" /> 다음으로 살펴볼 가이드</h2>
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

interface PostIllustrationProps {
  slug: string;
  index: 1 | 2;
  alt: string;
  caption: string;
  priority?: boolean;
}

function PostIllustration({
  slug,
  index,
  alt,
  caption,
  priority = false,
}: PostIllustrationProps) {
  return (
    <figure className="post-image post-generated-image">
      <Image
        src={`/images/posts/${slug}-${index}.webp`}
        alt={alt}
        width={1200}
        height={800}
        sizes="(max-width: 768px) calc(100vw - 32px), 760px"
        priority={priority}
      />
      <figcaption>{caption}</figcaption>
    </figure>
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
    case 'cta':
      return (
        <aside className="post-cta" key={key}>
          <p>{block.text}</p>
          <Link href={block.href} className="button button-primary">
            {block.label}
          </Link>
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
