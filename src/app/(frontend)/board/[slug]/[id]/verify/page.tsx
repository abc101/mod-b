import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import { canManagePost } from '@/lib/community/server'
import VerifyForm from './VerifyForm'

type Props = {
  params: Promise<{ slug: string; id: string }>
  searchParams: Promise<{ next?: string }>
}

export const dynamic = 'force-dynamic'

function getNextPath({
  slug,
  postId,
  next,
}: {
  slug: string
  postId: number | string
  next?: string
}) {
  if (next === 'edit') return `/board/${slug}/${postId}/edit`
  return `/board/${slug}/${postId}`
}

export default async function VerifyPage({ params, searchParams }: Props) {
  const { slug, id } = await params
  const { next } = await searchParams

  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)
  const postId = parseInt(id, 10)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 2,
    overrideAccess: true,
  }) as any

  if (!post || post.status === 'deleted' || post.isDeleted) {
    notFound()
  }

  const nextPath = getNextPath({
    slug: encodedSlug,
    postId: post.id,
    next,
  })

  const alreadyAllowed = await canManagePost({
    user: user as any,
    post,
  })

  if (alreadyAllowed) {
    redirect(nextPath)
  }

  if (post.author || !post.anonymousPasswordHash) {
    redirect(`/board/${encodedSlug}/${post.id}`)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/board/${encodedSlug}`} className="hover:text-gray-900">
          {post.board?.name || decodedSlug}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Verify</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Enter Password
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          This anonymous post requires a password.
        </p>

        <VerifyForm postId={post.id} nextPath={nextPath} />
      </div>
    </div>
  )
}