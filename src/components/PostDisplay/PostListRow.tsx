import type { PostDisplayPost, PostDisplayProps } from './types'
import Link from 'next/link'
import NewBadge from '@/components/NewBadge'
import { getPostThumbnail } from '@/lib/post-thumbnail'
import { getPostHref } from './utils'
import RankBadge from './RankBadge'
import PostMeta from './PostMeta'
import { getDisplayPost } from '@/lib/post-display'
import { getPostBoard } from './utils'

function getExcerpt(post: PostDisplayPost) {
  return String(post.contentHtml || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export default function PostListRow({
  post,
  href,
  index = 0,
  showRanking = false,
  showBoardName = true,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
  showExcerpt = true,
}: PostDisplayProps) {
  const thumbnail = getPostThumbnail(post)
  const excerpt = getExcerpt(post)
  const display = getDisplayPost(post)
  const board = getPostBoard(post)
  return (
    <li className="mb-3 last:mb-0">
      <Link
        href={getPostHref(post, href)}
        className="block px-4 py-3 hover:bg-gray-50 group"
      >
        <div className="flex items-start gap-3">
          {showRanking && <RankBadge index={index} small />}
          {showBoardName && board?.name && (
            <div className="shrink-0 pt-0.5">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">
                {board.name}
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              

              <div className="min-w-0 flex-1 truncate text-sm text-gray-900">
                <NewBadge createdAt={post.createdAt} />

                <span className="mr-1 text-xs">
                  {thumbnail?.url
                    ? thumbnail.source === 'youtube'
                      ? '▶️'
                      : '🖼️'
                    : '📝'}
                </span>

                <span className="font-medium group-hover:text-gray-700">
                  {display.title}
                </span>
              </div>

              <div className="hidden md:block shrink-0">
                <PostMeta
                  post={post}
                  showAuthor={showAuthor}
                  showDate={showDate}
                  showViewCount={showViewCount}
                />
              </div>
            </div>

            {showExcerpt && excerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                 {display.excerpt}
              </p>
            )}

            <div className="mt-1 md:hidden">
              <PostMeta
                post={post}
                showAuthor={showAuthor}
                showDate={showDate}
                showViewCount={showViewCount}
              />
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}