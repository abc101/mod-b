import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { slugifyTitle } from '@/lib/slugify'
import {
  getSitemapBoards,
  getSitemapPages,
  getSitemapPosts,
} from '@/lib/services/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const [pages, boards, posts] = await Promise.all([
    getSitemapPages({ payload }),
    getSitemapBoards({ payload }),
    getSitemapPosts({ payload }),
  ])

  const urls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  pages.docs.forEach((page: any) => {
    if (page.slug === 'home') return

    urls.push({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  boards.docs.forEach((board: any) => {
    urls.push({
      url: `${SITE_URL}/board/${encodeURIComponent(board.slug)}`,
      lastModified: board.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  const tagSet = new Set<string>()

  posts.docs.forEach((post: any) => {
    const boardSlug = post.board?.slug
    if (!boardSlug) return

    const postSlug = encodeURIComponent(slugifyTitle(post.title))

    urls.push({
      url: `${SITE_URL}/board/${encodeURIComponent(boardSlug)}/${post.id}/${postSlug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })

    post.tags?.forEach((t: any) => {
      if (t.tag) tagSet.add(t.tag)
    })
  })

  tagSet.forEach((tag) => {
    urls.push({
      url: `${SITE_URL}/tag/${encodeURIComponent(tag)}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  })

  return urls
}