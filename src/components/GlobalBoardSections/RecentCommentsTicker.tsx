'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import LocalTime from '@/components/LocalTime'
import UserDisplay from '@/components/UserDisplay'
import type { GlobalBoardComment } from '@/types/global-board'
import { getRelation } from '@/lib/relations'

type Props = {
  title?: string
  comments: any[]
  intervalMs?: number
}

export default function RecentCommentsTicker({
  title = '💬 Recent Comments',
  comments,
  intervalMs = 4000,
}: Props) {
  const validComments = useMemo(
    () =>
      comments.filter((comment) => {
        const post = getRelation(comment.post)
        const board = getRelation(post?.board)

        return post && board && board.slug
      }),
    [comments],
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (validComments.length <= 1) return

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % validComments.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [validComments.length, intervalMs])

  if (validComments.length === 0) return null

  const comment = validComments[activeIndex] || validComments[0]
  const post = getRelation(comment.post)
  const board = getRelation(post?.board)
  const author = getRelation(comment.author)

  if (!post || !board?.slug) return null

  const href = `/board/${encodeURIComponent(board.slug)}/${post.id}`

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="h-[76px] overflow-hidden">
        <Link
          key={comment.id}
          href={href}
          className="block px-4 py-3 hover:bg-gray-50 animate-date-time-fade"
        >
          <p className="text-sm text-gray-800 truncate">
            {comment.content}
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <UserDisplay
              user={comment.author}
              anonymousAuthor={comment.anonymousAuthor}
              link={false}
            />
            <span>·</span>
            <span className="truncate">{post.title}</span>
            <span>·</span>
            <LocalTime dateString={comment.createdAt} />
          </div>
        </Link>
      </div>
    </section>
  )
}