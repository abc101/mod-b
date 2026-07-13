import Link from 'next/link'
import NewBadge from '@/components/NewBadge'
import LocalTime from '@/components/LocalTime'
import type { PostDisplayProps } from './types'
import { getPostHref } from './utils'
import RankBadge from './RankBadge'
import PostThumbnail from './PostThumbnail'
import PostMeta from './PostMeta'
import { getDisplayPost } from '@/lib/post-display'
import { getPostBoard } from './utils'

export default function PostGalleryCard({
  post,
  href,
  index = 0,
  showRanking = false,
  showBoardName = true,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
}: PostDisplayProps) {
  const display = getDisplayPost(post)
  const board = getPostBoard(post)
  return (
    <Link
      href={getPostHref(post, href)}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {showRanking && (
          <div className="absolute left-3 top-3 z-10">
            <RankBadge index={index} />
          </div>
        )}

        <PostThumbnail
          post={post}
          className="relative h-full w-full"
          imageClassName="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="p-4">
        {showBoardName && board?.name && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {board.name}
          </span>
        )}

        <h3 className="text-sm font-medium text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-gray-700">
          <NewBadge createdAt={post.createdAt} />
          {display.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <PostMeta
            post={post}
            showAuthor={showAuthor}
            showDate={false}
            showViewCount={showViewCount}
          />

          {showDate && (
            <span className="shrink-0">
              <LocalTime dateString={post.createdAt} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}