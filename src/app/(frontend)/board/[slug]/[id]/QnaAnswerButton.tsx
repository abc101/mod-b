'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleQnaAnswered } from './actions'

type Props = {
  postId: number
  slug: string
  isAnswered?: boolean
}

export default function QnaAnswerButton({
  postId,
  slug,
  isAnswered,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return

    setLoading(true)

    try {
      await toggleQnaAnswered(postId, slug)
      router.refresh()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update Q&A status.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 ${
        isAnswered
          ? 'bg-orange-500 hover:bg-orange-600'
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {loading
        ? 'Updating...'
        : isAnswered
          ? 'Mark as Pending'
          : 'Mark as Answered'}
    </button>
  )
}