import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getPostsByBoard } from '@/lib/services/posts'
import {
  PostListRow,
  PostCardRow,
  PostGalleryCard,
  PostCompactRow,
  PostGrid,
} from '@/components/PostDisplay'
import EmptyState from '@/components/EmptyState'

type Props = {
  board: { id: number; name: string; slug: string; boardType?: string } | number
  customTitle?: string
  postCount?: number
  displayType?: 'list' | 'card' | 'gallery' | 'compact'
  gridColumns?: '1' | '2' | '3' | '4'
  showAuthor?: boolean
  showDate?: boolean
  showMoreLink?: boolean
  showViewCount?: boolean
}

function SectionHeader({
  title,
  slug,
  showMoreLink,
}: {
  title: string
  slug: string
  showMoreLink: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <h2 className="font-semibold text-gray-900">{title}</h2>

      {showMoreLink && (
        <Link
          href={`/board/${encodeURIComponent(slug)}`}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          More +
        </Link>
      )}
    </div>
  )
}

export default async function SingleBoardComponent({
  board,
  customTitle,
  postCount = 5,
  displayType = 'list',
  gridColumns = '3',
  showAuthor = true,
  showDate = true,
  showMoreLink = true,
  showViewCount = false,
}: Props) {
  const payload = await getPayload({ config: configPromise })

  const boardId = typeof board === 'object' ? board.id : board
  let boardInfo = typeof board === 'object' ? board : null

  if (!boardInfo) {
    boardInfo = (await payload.findByID({
      collection: 'boards',
      id: boardId,
      depth: 0,
    })) as any
  }

  const slug = boardInfo?.slug
  if (!slug) return null

  const posts = await getPostsByBoard({
    payload,
    boardId,
    limit: postCount,
    depth: 2,
  })

  const title = customTitle || boardInfo?.name || 'Board'
  const resolvedDisplayType = displayType || boardInfo?.boardType || 'list'

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title={title}
          slug={slug}
          showMoreLink={showMoreLink}
        />

        {posts.docs.length === 0 ? (
          <EmptyState message="No posts yet." />
        ) : (
          <div className="p-3">
            <PostGrid
              displayType={resolvedDisplayType}
              gridColumns={gridColumns}
            >
              {posts.docs.map((post: any, index: number) => {
                const href = `/board/${encodeURIComponent(slug)}/${post.id}`

                if (resolvedDisplayType === 'card') {
                  return (
                    <PostCardRow
                      key={post.id}
                      post={post}
                      href={href}
                      index={index}
                      showRanking={false}
                      showBoardName={false}
                      showAuthor={showAuthor}
                      showDate={showDate}
                      showViewCount={showViewCount}
                    />
                  )
                }

                if (resolvedDisplayType === 'compact') {
                  return (
                    <PostCompactRow
                      key={post.id}
                      post={post}
                      href={href}
                      index={index}
                      showRanking={false}
                      showDate={showDate}
                    />
                  )
                }

                if (resolvedDisplayType === 'gallery') {
                  return (
                    <PostGalleryCard
                      key={post.id}
                      post={post}
                      href={href}
                      index={index}
                      showRanking={false}
                      showBoardName={false}
                      showAuthor={showAuthor}
                      showDate={showDate}
                      showViewCount={showViewCount}
                    />
                  )
                }

                return (
                  <PostListRow
                    key={post.id}
                    post={post}
                    href={href}
                    index={index}
                    showRanking={false}
                    showBoardName={false}
                    showAuthor={showAuthor}
                    showDate={showDate}
                    showViewCount={showViewCount}
                  />
                )
              })}
            </PostGrid>
          </div>
        )}
      </div>
    </section>
  )
}