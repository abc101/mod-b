import type { Post } from '@/types/payload'

import Link from 'next/link'

import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'
import UserDisplay from '@/components/UserDisplay'

type Props = {
  posts: Post[]
  boardSlug: string
  showAuthor?: boolean
  showViewCount?: boolean
  showDate?: boolean
  className?: string
  title?: string
}

export default function PinnedNoticeList({
  posts,
  boardSlug,
  showAuthor = true,
  showViewCount = true,
  showDate = true,
  className = '',
  title = 'Pinned Notices',
}: Props) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section
      className={`mt-6 overflow-hidden rounded-lg border border-blue-200 bg-white ${className}`}
      aria-labelledby="pinned-notice-title"
    >
      <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-2.5">
        <h2
          id="pinned-notice-title"
          className="text-sm font-semibold text-blue-900"
        >
          {title}
        </h2>

        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {posts.length}
        </span>
      </div>

      <div>
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b border-blue-100 last:border-b-0 hover:bg-blue-50/60"
          >
            <Link
              href={`/board/${boardSlug}/${post.id}`}
              className="flex min-w-0 flex-col gap-1.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="shrink-0 text-sm"
                  aria-label="Pinned notice"
                  title="Pinned notice"
                >
                  📌
                </span>

                <NewBadge createdAt={post.createdAt} />

                {post.isSecret && (
                  <span className="shrink-0 text-xs" aria-label="Secret post">
                    🔒
                  </span>
                )}

                <span className="min-w-0 truncate text-sm font-medium text-gray-900">
                  {post.title}
                </span>

                {post.attachments && post.attachments.length > 0 && (
                  <span
                    className="shrink-0 text-xs text-gray-400"
                    aria-label="Has attachments"
                  >
                    📎
                  </span>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-x-2 text-xs text-gray-500 sm:flex-nowrap">
                {showAuthor && (
                  <UserDisplay
                    user={post.author}
                    anonymousAuthor={post.anonymousAuthor ?? undefined}
                    link={false}
                  />
                )}

                {showAuthor && (showViewCount || showDate) && (
                  <span aria-hidden="true" className="text-gray-300">
                    ·
                  </span>
                )}

                {showViewCount && (
                  <span aria-label={`${post.viewCount || 0} views`}>
                    👁 {post.viewCount || 0}
                  </span>
                )}

                {showViewCount && showDate && (
                  <span aria-hidden="true" className="text-gray-300">
                    ·
                  </span>
                )}

                {showDate && <LocalTime dateString={post.createdAt} />}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
