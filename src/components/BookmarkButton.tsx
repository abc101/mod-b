'use client'

import { useState, useTransition } from 'react'
import { toggleBookmarkAction } from '@/app/(frontend)/board/[slug]/[id]/bookmark/actions'

type Props = {
  postId: number
  boardSlug: string
  initialBookmarked?: boolean
  isLoggedIn?: boolean
}

export default function BookmarkButton({
  postId,
  boardSlug,
  initialBookmarked = false,
  isLoggedIn = false,
}: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/board/${boardSlug}/${postId}`
      return
    }

    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(postId, boardSlug)
        setBookmarked(result.bookmarked)
      } catch (err: any) {
        alert(err?.message || 'Failed to update bookmark.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`text-sm px-3 py-1.5 rounded border transition disabled:opacity-50 ${
        bookmarked
          ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
      aria-pressed={bookmarked}
    >
      {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  )
}