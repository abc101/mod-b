import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { slugifyTitle } from '@/lib/slugify'
import { getLatestPosts } from '@/lib/services/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(value = '') {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function GET() {
  const payload = await getPayload({ config: configPromise })

  const posts = await getLatestPosts({
    payload,
    postCount: 50,
    depth: 1,
  })

  const items = posts.docs
    .map((post: any) => {
      const boardSlug = post.board?.slug
      if (!boardSlug) return ''

      const postSlug = encodeURIComponent(slugifyTitle(post.title))
      const url = `${SITE_URL}/board/${encodeURIComponent(boardSlug)}/${post.id}/${postSlug}`
      const description = stripHtml(post.excerpt || post.contentHtml || '')

      return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
        <description>${escapeXml(description)}</description>
      </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(process.env.NEXT_PUBLIC_SITE_NAME || 'Latest Posts')}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Latest posts')}</description>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}