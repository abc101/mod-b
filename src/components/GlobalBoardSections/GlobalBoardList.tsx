import Link from 'next/link'
import UserDisplay from '@/components/UserDisplay'
import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'
import type { GlobalBoardPost } from '@/types/global-board'
import { getRelation } from '@/lib/relations'

type Props = {
  title: string
  boardSlug: string
  posts: GlobalBoardPost[]
  showAuthor?: boolean
  showDate?: boolean
  showMore?: boolean
}

export default function GlobalBoardList({
  title,
  boardSlug,
  posts,
  showAuthor = true,
  showDate = true,
  showMore = true
}: Props) {
  if (!posts.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {showMore && boardSlug && (
          <Link href={`/board/${boardSlug}`} className="text-xs text-gray-500 hover:text-gray-900">
            More +
          </Link>
        )}
      </div>

      <ul className="divide-y divide-gray-100">
        {posts.map((post) => {
          const board = getRelation(post.board)
          const author = getRelation(post.author)
          const hrefBoardSlug = post.boardSlug || board?.slug || boardSlug

          if (!hrefBoardSlug) return null

          return (
            <li key={post.id}>
              <Link
                href={`/board/${encodeURIComponent(hrefBoardSlug)}/${post.id}`}
                className="block px-4 py-2.5 hover:bg-gray-50"
              >
                <div className="truncate text-sm text-gray-800">
                  <span className="mr-2 text-xs text-blue-600">
                    [{board?.name}]
                  </span>
                  <NewBadge createdAt={post.createdAt} />
                  {post.title}
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  {showAuthor && (
                    <span>
                      <UserDisplay
                        user={author}
                        anonymousAuthor={post.anonymousAuthor ?? undefined}
                        link={false}
                      />
                    </span>
                  )}

                  {showDate && (
                    <span>
                      <LocalTime dateString={post.createdAt} />
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}