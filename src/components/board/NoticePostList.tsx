import type { Post } from '@/types/payload'

import Link from 'next/link'

import EmptyState from '@/components/EmptyState'
import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'

type Props = {
  posts: Post[]
  boardSlug: string
}

export default function NoticePostList({
  posts,
  boardSlug,
}: Props) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="hidden grid-cols-[1fr_120px_80px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-500 md:grid">
        <span>Title</span>
        <span className="text-center">Date</span>
        <span className="text-center">Views</span>
      </div>

      {posts.length === 0 ? (
        <EmptyState message="No announcements yet." />
      ) : (
        posts.map((post) => (
          <article
            key={post.id}
            className="border-b border-gray-100 last:border-0 hover:bg-blue-50"
          >
            <Link
              href={`/board/${boardSlug}/${post.id}`}
              className="grid grid-cols-1 gap-1 px-4 py-3 md:grid-cols-[1fr_120px_80px] md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                  Notice
                </span>

                <NewBadge createdAt={post.createdAt} />

                <span className="min-w-0 truncate text-sm text-gray-900">
                  {post.title}
                </span>
              </div>

              <span className="text-xs text-gray-400 md:text-center">
                <LocalTime dateString={post.createdAt} />
              </span>

              <span className="text-xs text-gray-400 md:text-center">
                {post.viewCount || 0}
              </span>
            </Link>
          </article>
        ))
      )}
    </div>
  )
}
