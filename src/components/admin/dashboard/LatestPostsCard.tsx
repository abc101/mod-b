import type { PaginatedDocs } from 'payload'
import type { Post } from '@/types/payload'

import Link from 'next/link'

import LocalTime from '@/components/LocalTime'
import DashboardSection from './DashboardSection'
import { getRelation } from '@/lib/relations'

export default function LatestPostsCard({
  posts,
}: {
  posts: PaginatedDocs<Post>
}) {
  return (
    <DashboardSection title="Latest Posts">
      <ul className="divide-y divide-gray-100">
        {posts.docs.map((post) => {
          const board = getRelation(post.board)

          const href = board?.slug
            ? `/board/${encodeURIComponent(board.slug)}/${post.id}`
            : '#'

          return (
            <li key={post.id}>
              <Link
                href={href}
                className="block px-4 py-3 hover:bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900">
                  {post.title}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  {board?.name || board?.slug || 'Board'} ·{' '}
                  <LocalTime dateString={post.createdAt} />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </DashboardSection>
  )
}