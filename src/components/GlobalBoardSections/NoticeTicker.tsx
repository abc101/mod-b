'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'

type NoticePost = {
  id: number
  title: string
  createdAt: string
  boardSlug?: string | null
}

type Props = {
  title: string
  boardSlug?: string
  posts: NoticePost[]
  intervalMs?: number
}

export default function NoticeTicker({
  title,
  boardSlug = '',
  posts,
  intervalMs = 4000,
}: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (posts.length <= 1) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [posts.length, intervalMs])

  if (!posts.length) return null

  const post = posts[index]
  const isSingle = posts.length <= 1
  const hrefBoardSlug = post.boardSlug || boardSlug

  if (!hrefBoardSlug) return null

  return (
    <section className="border-b border-blue-100 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-9 gap-3 overflow-hidden">
          <Link
            href={`/board/${encodeURIComponent(hrefBoardSlug)}`}
            className="shrink-0 text-xs font-semibold text-blue-700"
          >
            📢 {/* {title} */}
          </Link>

          <div className="relative flex-1 h-9 overflow-hidden">
            <Link
              key={post.id}
              href={`/board/${encodeURIComponent(hrefBoardSlug)}/${post.id}`}
              className={`absolute inset-0 flex items-center ${
                isSingle ? '' : 'animate-notice-slide-up'
              }`}
            >
              <div className="flex-1 text-center px-4">
                <span className="block truncate text-sm text-gray-800">
                  <NewBadge createdAt={post.createdAt} />
                  {post.title}
                </span>
              </div>

              <span className="shrink-0 text-xs text-gray-400">
                <LocalTime dateString={post.createdAt} />
              </span>
            </Link>
          </div>

          <Link
            href={`/board/${encodeURIComponent(hrefBoardSlug)}`}
            className="shrink-0 text-xs text-gray-500 hover:text-gray-900"
          >
            More +
          </Link>
        </div>
      </div>
    </section>
  )
}