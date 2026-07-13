import Link from 'next/link'
import NewBadge from '@/components/NewBadge'
import type { PostDisplayProps } from './types'
import { getPostHref } from './utils'
import RankBadge from './RankBadge'
import PostThumbnail from './PostThumbnail'
import PostMeta from './PostMeta'
import { getDisplayPost } from '@/lib/post-display'
import { getPostBoard } from './utils'

function getExcerpt(post: any) {
  const source =
    post.excerpt ||
    post.summary ||
    post.contentHtml ||
    ''

  return String(source)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
}

export default function PostCardRow({
  post,
  href,
  index = 0,
  showRanking = false,
  showBoardName = true,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
  showExcerpt = false,
}: PostDisplayProps) {
   const excerpt = getExcerpt(post)
   const display = getDisplayPost(post)
   const board = getPostBoard(post)

  return (
    <Link
      href={getPostHref(post, href)}
      className="flex gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors group"
    >
      {showRanking && (
        <div className="flex items-center">
          <RankBadge index={index} small />
        </div>
      )}

      <PostThumbnail
        post={post}
        className="relative w-16 h-16 rounded overflow-hidden shrink-0 bg-gray-100 border border-gray-200"
        imageClassName="object-cover"
        sizes="64px"
      />

      <div className="min-w-0 flex-1">
        {showBoardName && board?.name && (
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-1">
            {board.name}
          </span>
        )}

        <div className="text-sm font-medium text-gray-900 line-clamp-2">
          <NewBadge createdAt={post.createdAt} />
          {display.title}
        </div>

          {showExcerpt && excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-400">
              {display.excerpt}
            </p>
          )}


        <div className="mt-1">
          <PostMeta
            post={post}
            showAuthor={showAuthor}
            showDate={showDate}
            showViewCount={showViewCount}
          />
        </div>
      </div>
    </Link>
  )
}