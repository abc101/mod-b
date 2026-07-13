'use client'

import { deletePost } from './actions'

type Props = {
  postId: number
  boardSlug: string
}

export default function DeletePostButton({ postId, boardSlug }: Props) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return
    await deletePost(postId, boardSlug)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm border border-red-300 text-red-500 px-3 py-1.5 rounded hover:bg-red-50"
    >
      Delete Post
    </button>
  )
}
