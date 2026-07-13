'use client'

import { acceptAnswer, unacceptAnswer } from './qnaActions'

type Props = {
  commentId: number
  postId: number
  boardSlug: string
  isAccepted: boolean
  canAccept: boolean
}

export default function AcceptAnswerButton({ commentId, postId, boardSlug, isAccepted, canAccept }: Props) {
  if (!canAccept && !isAccepted) return null

  const handleAccept = async () => {
    if (isAccepted) {
      await unacceptAnswer(postId, boardSlug)
    } else {
      await acceptAnswer(commentId, postId, boardSlug)
    }
  }

  if (isAccepted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
          ✓ Accepted Answer
        </span>
        {canAccept && (
          <button
            onClick={handleAccept}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Unaccept
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={handleAccept}
      className="text-xs border border-green-400 text-green-600 px-2.5 py-1 rounded hover:bg-green-50"
    >
      ✓ Accept Answer
    </button>
  )
}
