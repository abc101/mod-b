import type { PaginatedDocs } from 'payload'
import type { Comment } from '@/types/payload'

import Link from 'next/link'

import LocalTime from '@/components/LocalTime'
import DashboardSection from './DashboardSection'
import { getRelation } from '@/lib/relations'

export default function RecentCommentsCard({
  comments,
}: {
  comments: PaginatedDocs<Comment>
}) {
  return (
    <DashboardSection title="Recent Comments">
      <ul className="divide-y divide-gray-100">
        {comments.docs.map((comment) => {
          const post = getRelation(comment.post)
          const board = getRelation(post?.board)

          const href =
            post?.id && board?.slug
              ? `/board/${encodeURIComponent(board.slug)}/${post.id}`
              : '#'

          return (
            <li key={comment.id}>
              <Link
                href={href}
                className="block px-4 py-3 hover:bg-gray-50"
              >
                <div className="line-clamp-2 text-sm text-gray-800">
                  {comment.content}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  {post?.title || 'Post'} ·{' '}
                  <LocalTime dateString={comment.createdAt} />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </DashboardSection>
  )
}