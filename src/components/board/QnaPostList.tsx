import type { Post } from '@/types/payload'

import Link from 'next/link'

import EmptyState from '@/components/EmptyState'
import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'
import UserDisplay from '@/components/UserDisplay'
import { getDisplayPost } from '@/lib/post-display'

type Props = {
  posts: Post[]
  boardSlug: string
}

export default function QnaPostList({
  posts,
  boardSlug,
}: Props) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="hidden grid-cols-[60px_1fr_100px_80px_80px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-500 md:grid">
        <span className="text-center">Status</span>
        <span>Title</span>
        <span className="text-center">Author</span>
        <span className="text-center">Views</span>
        <span className="text-center">Date</span>
      </div>

      {posts.length === 0 ? (
        <EmptyState message="No questions yet." />
      ) : (
        posts.map((post) => {
          const displayPost = getDisplayPost(post, {
            boardType: 'qna',
          })

          return (
            <article
              key={post.id}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <Link
                href={`/board/${boardSlug}/${post.id}`}
                className="grid grid-cols-1 items-center gap-1 px-4 py-3 md:grid-cols-[60px_1fr_100px_80px_80px] md:gap-4"
              >
                <div className="flex md:justify-center">
                  {post.isAnswered ? (
                    <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                      Answered
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-400 px-2 py-0.5 text-xs text-white">
                      Pending
                    </span>
                  )}
                </div>

                <span className="min-w-0 truncate text-sm text-gray-900">
                  <NewBadge createdAt={post.createdAt} />
                  {displayPost.title}
                </span>

                <span className="truncate text-xs text-gray-500 md:text-center">
                  <UserDisplay
                    user={post.author}
                    anonymousAuthor={post.anonymousAuthor ?? undefined}
                    link={false}
                  />
                </span>

                <span className="text-xs text-gray-400 md:text-center">
                  {post.viewCount || 0}
                </span>

                <span className="text-xs text-gray-400 md:text-center">
                  <LocalTime dateString={post.createdAt} />
                </span>
              </Link>
            </article>
          )
        })
      )}
    </div>
  )
}
