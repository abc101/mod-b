import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getPostsByBoard } from '@/lib/services/posts'
import EmptyState from '@/components/EmptyState'
import {
  PostListRow,
  PostCardRow,
  PostGalleryCard,
  PostCompactRow,
} from '@/components/PostDisplay'

type BoardItem = {
  board: { id: number; name: string; slug: string; boardType?: string }
  customTitle?: string
  postCount?: number
  displayType?: 'list' | 'card' | 'gallery' | 'compact'
}

type Props = {
  sectionTitle?: string
  boards: BoardItem[]
  columns?: '1' | '2' | '3' | '4'
  showMoreLink?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showViewCount?: boolean
}

const colsMap: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

export default async function BoardGridComponent({
  sectionTitle,
  boards = [],
  columns = '2',
  showMoreLink = true,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
}: Props) {
  const payload = await getPayload({ config: configPromise })

  const boardsWithPosts = await Promise.all(
    boards.map(async (item) => {
      const boardId =
        typeof item.board === 'object' ? item.board.id : item.board

      const boardData =
        typeof item.board === 'object' ? item.board : null

      const posts = await getPostsByBoard({
        payload,
        boardId,
        limit: item.postCount || 5,
        depth: 2,
      })

      return {
        ...item,
        board: boardData,
        posts: posts.docs,
      }
    }),
  )

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {sectionTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {sectionTitle}
        </h2>
      )}

      <div className={`grid gap-6 ${colsMap[columns] || colsMap['2']}`}>
        {boardsWithPosts.map((item, idx) => {
          const displayType =
            item.displayType || item.board?.boardType || 'list'

          const boardSlug = item.board?.slug || ''

          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  {item.customTitle || item.board?.name}
                </h3>

                {showMoreLink && boardSlug && (
                  <Link
                    href={`/board/${encodeURIComponent(boardSlug)}`}
                    className="text-xs text-gray-500 hover:text-gray-900"
                  >
                    More +
                  </Link>
                )}
              </div>

              {item.posts.length === 0 ? (
                <EmptyState
                  message="No posts yet."
                  className="py-8"
                />
              ) : displayType === 'gallery' ? (
                <div className="grid grid-cols-2 gap-2 p-2 bg-white">
                  {item.posts.map((post: any, index: number) => (
                    <PostGalleryCard
                      key={post.id}
                      post={post}
                      href={`/board/${encodeURIComponent(boardSlug)}/${post.id}`}
                      index={index}
                      showRanking={false}
                      showBoardName={false}
                      showAuthor={showAuthor}
                      showDate={showDate}
                      showViewCount={showViewCount}
                    />
                  ))}
                </div>
              ) : displayType === 'card' ? (
                <div className="p-3 space-y-3">
                  {item.posts.map((post: any, index: number) => (
                    <PostCardRow
                      key={post.id}
                      post={post}
                      href={`/board/${encodeURIComponent(boardSlug)}/${post.id}`}
                      index={index}
                      showRanking={false}
                      showBoardName={false}
                      showAuthor={showAuthor}
                      showDate={showDate}
                      showViewCount={showViewCount}
                    />
                  ))}
                </div>
              ) : displayType === 'compact' ? (
                <div className="p-2 space-y-1">
                  {item.posts.map((post: any, index: number) => (
                    <PostCompactRow
                      key={post.id}
                      post={post}
                      href={`/board/${encodeURIComponent(boardSlug)}/${post.id}`}
                      index={index}
                      showRanking={false}
                      showDate={showDate}
                    />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {item.posts.map((post: any, index: number) => (
                    <PostListRow
                      key={post.id}
                      post={post}
                      href={`/board/${encodeURIComponent(boardSlug)}/${post.id}`}
                      index={index}
                      showRanking={false}
                      showBoardName={false}
                      showAuthor={showAuthor}
                      showDate={showDate}
                      showViewCount={showViewCount}
                      showExcerpt={false}
                    />
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}