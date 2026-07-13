import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import EditForm from './EditForm'
import DeletePostButton from './DeletePostButton'
import { canManagePost } from '@/lib/community/server'

import type { Board, Post, User } from '@/types/payload'

type Props = {
  params: Promise<{ slug: string; id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditPage({ params }: Props) {
  const { slug, id } = await params
  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)
  const postId = parseInt(id, 10)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const post = (await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 2,
    overrideAccess: true,
  })) as Post | null

  if (!post || post.status === 'deleted' || post.isDeleted) {
    notFound()
  }

  const canEdit = await canManagePost({
    user: currentUser,
    post,
  })

  if (!canEdit) {
    const isAnonymousPost = !post.author && !!post.anonymousPasswordHash

    if (isAnonymousPost) {
      redirect(`/board/${encodedSlug}/${post.id}/verify?next=edit`)
    }

    redirect(`/board/${encodedSlug}/${post.id}`)
  }

  const board =
    post.board && typeof post.board === 'object'
      ? (post.board as Board)
      : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>›</span>
        <Link href={`/board/${encodedSlug}`} className="hover:text-gray-900">
          {board?.name || decodedSlug}
        </Link>
        <span>›</span>
        <Link
          href={`/board/${encodedSlug}/${post.id}`}
          className="hover:text-gray-900 truncate max-w-48"
        >
          {post.title}
        </Link>
        <span>›</span>
        <span className="text-gray-900">Edit</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>

          <DeletePostButton postId={Number(post.id)} boardSlug={encodedSlug} />
        </div>

        <EditForm
          post={post}
          boardSlug={encodedSlug}
          userRole={currentUser?.role ?? null}
        />
      </div>
    </div>
  )
}