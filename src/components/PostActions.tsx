'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deletePost } from '@/app/(frontend)/board/[slug]/[id]/edit/actions'
import { useAnonymousAccess } from '@/components/AnonymousAccessProvider'

type Props = {
  post: any
  boardSlug: string
  canManageByLogin: boolean
}

export default function PostActions({
  post,
  boardSlug,
  canManageByLogin,
}: Props) {
  const router = useRouter()
  const { verifyResource } = useAnonymousAccess()
  const [isPending, startTransition] = useTransition()

  const isAnonymousPost =
    !post.author && !!post.anonymousPasswordHash

  const verifyIfNeeded = async (mode: 'edit' | 'delete') => {
    if (canManageByLogin || !isAnonymousPost) return true

    return verifyResource({
      type: 'post',
      id: Number(post.id),
      title: mode === 'delete' ? 'Delete Post' : 'Edit Post',
      message: 'Please enter the password for this anonymous post.',
      confirmLabel: mode === 'delete' ? 'Delete' : 'Continue',
    })
  }

  const handleEdit = async () => {
    const ok = await verifyIfNeeded('edit')
    if (!ok) return

    router.push(`/board/${boardSlug}/${post.id}/edit`)
  }

  const handleDelete = async () => {
    const ok = await verifyIfNeeded('delete')
    if (!ok) return

    if (!confirm('Delete this post?')) return

    startTransition(async () => {
      await deletePost(post.id, boardSlug)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleEdit}
        disabled={isPending}
        className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm border border-red-200 text-red-500 px-3 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}