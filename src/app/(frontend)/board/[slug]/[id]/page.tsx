import type { Post } from '@/types/payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { slugifyTitle } from '@/lib/slugify'
import { getPostById } from '@/lib/services/posts'

type Props = {
  params: Promise<{ slug: string; id: string }>
}

export const dynamic = 'force-dynamic'

export default async function PostRedirectPage({ params }: Props) {
  const { slug, id } = await params

  const payload = await getPayload({ config: configPromise })

  const post = (await getPostById({
    payload,
    id: parseInt(id, 10),
    depth: 1,
  })) as Post | null

  if (!post) notFound()

  const canonicalSlug = slugifyTitle(post.title)
  const encodedSlug = encodeURIComponent(canonicalSlug)

  redirect(`/board/${encodeURIComponent(slug)}/${post.id}/${encodedSlug}`)
}