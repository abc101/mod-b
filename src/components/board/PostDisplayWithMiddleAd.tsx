import type { Post } from '@/types/payload'

import BoardAdvertisements from '@/components/Advertisements/BoardAdvertisements'
import EmptyState from '@/components/EmptyState'
import {
  PostCardRow,
  PostCompactRow,
  PostGalleryCard,
  PostGrid,
  PostListRow,
} from '@/components/PostDisplay'

export type DisplayType = 'list' | 'card' | 'gallery' | 'compact'

type Props = {
  posts: Post[]
  firstPosts: Post[]
  secondPosts: Post[]
  displayType: DisplayType
  gridColumns: '1' | '2' | '3' | '4'
  encodedSlug: string
  boardId: number | string
  showAuthor: boolean
  showDate: boolean
  showViewCount: boolean
  shouldShowMiddleAd: boolean
}

export default function PostDisplayWithMiddleAd({
  posts,
  firstPosts,
  secondPosts,
  displayType,
  gridColumns,
  encodedSlug,
  boardId,
  showAuthor,
  showDate,
  showViewCount,
  shouldShowMiddleAd,
}: Props) {
  if (posts.length === 0) {
    return <EmptyState message="No posts yet." />
  }

  return (
    <div className="mt-6 space-y-6">
      <PostGrid displayType={displayType} gridColumns={gridColumns}>
        <RenderPostItems
          docs={firstPosts}
          displayType={displayType}
          encodedSlug={encodedSlug}
          showAuthor={showAuthor}
          showDate={showDate}
          showViewCount={showViewCount}
        />
      </PostGrid>

      {shouldShowMiddleAd && (
        <BoardAdvertisements
          position="board-middle"
          boardId={boardId}
          className="my-6"
        />
      )}

      {secondPosts.length > 0 && (
        <PostGrid displayType={displayType} gridColumns={gridColumns}>
          <RenderPostItems
            docs={secondPosts}
            displayType={displayType}
            encodedSlug={encodedSlug}
            showAuthor={showAuthor}
            showDate={showDate}
            showViewCount={showViewCount}
          />
        </PostGrid>
      )}
    </div>
  )
}

function RenderPostItems({
  docs,
  displayType,
  encodedSlug,
  showAuthor,
  showDate,
  showViewCount,
}: {
  docs: Post[]
  displayType: DisplayType
  encodedSlug: string
  showAuthor: boolean
  showDate: boolean
  showViewCount: boolean
}) {
  return (
    <>
      {docs.map((post, index) => {
        const href = `/board/${encodedSlug}/${post.id}`

        if (displayType === 'card') {
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

        if (displayType === 'compact') {
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

        if (displayType === 'gallery') {
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
    </>
  )
}
