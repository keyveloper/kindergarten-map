import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/posts';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: new Date(),
    },
    ...posts,
  ];
}
