import { getPayload } from 'payload'
import configPromise from '@payload-config'
import EmptyState from '@/components/EmptyState'
import { getTrendingPosts } from '@/lib/services/posts'
import {
  PostListRow,
  PostCardRow,
  PostGalleryCard,
  PostCompactRow,
  PostGrid,
} from '@/components/PostDisplay'

type Props = {
  sectionTitle?: string
  postCount?: number
  periodDays?: number
  filterBoards?: { id: number }[]
  displayType?: 'list' | 'card' | 'gallery' | 'compact'
  gridColumns?: '1' | '2' | '3' | '4'
  showRanking?: boolean
  showBoardName?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showViewCount?: boolean
}

function SectionShell({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🔥 {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export default async function TrendingPostsComponent({
  sectionTitle = 'Trending Posts',
  postCount = 10,
  periodDays = 7,
  filterBoards = [],
  displayType = 'list',
  gridColumns = '3',
  showRanking = true,
  showBoardName = true,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
}: Props) {
  const payload = await getPayload({ config: configPromise })

  const posts = await getTrendingPosts({
    payload,
    postCount,
    periodDays,
    filterBoards,
    depth: 2,
  })

  return (
    <SectionShell title={sectionTitle}>
      {posts.docs.length === 0 ? (
        <EmptyState message="No trending posts yet." />
      ) : (
        <PostGrid displayType={displayType} gridColumns={gridColumns}>
          {posts.docs.map((post: any, index: number) => {
            if (displayType === 'card') {
              return (
                <PostCardRow
                  key={post.id}
                  post={post}
                  index={index}
                  showRanking={showRanking}
                  showBoardName={showBoardName}
                  showAuthor={showAuthor}
                  showDate={showDate}
                  showViewCount={showViewCount}
                />
              )
            }

            if (displayType === 'compact') {
              return (
                <PostCompactRow
                  key={post.id}
                  post={post}
                  index={index}
                  showRanking={showRanking}
                  showDate={showDate}
                />
              )
            }

            if (displayType === 'gallery') {
              return (
                <PostGalleryCard
                  key={post.id}
                  post={post}
                  index={index}
                  showRanking={showRanking}
                  showBoardName={showBoardName}
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
                index={index}
                showRanking={showRanking}
                showBoardName={showBoardName}
                showAuthor={showAuthor}
                showDate={showDate}
                showViewCount={showViewCount}
              />
            )
          })}
        </PostGrid>
      )}
    </SectionShell>
  )
}