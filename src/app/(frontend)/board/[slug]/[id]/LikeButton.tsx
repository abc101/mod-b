'use client'

import { useState } from 'react'
import { toggleLikePost } from './actions'

type Props = {
  postId: number
  initialLikes: number
}

export default function LikeButton({ postId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [isPending, setIsPending] = useState(false)

  const handleLike = async () => {
    if (isPending) return
    setIsPending(true)

    try {
      await toggleLikePost(postId, likes)
      // If the API call is successful, we optimistically update the like count
      setLikes(prev => prev + 1)
    } catch (err: any) {
      alert(err.message || 'Failed to like this post')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>❤️</span>
      <span>{likes}</span>
    </button>
  )
}