import Link from 'next/link'
import NewBadge from '@/components/NewBadge'
import LocalTime from '@/components/LocalTime'
import type { PostDisplayProps } from './types'
import { getPostHref } from './utils'
import RankBadge from './RankBadge'
import { getDisplayPost } from '@/lib/post-display'

export default function PostCompactRow({
  post,
  href,
  index = 0,
  showRanking = false,
  showDate = true,
}: PostDisplayProps) {
  const display = getDisplayPost(post)
  return (
    <Link
      href={getPostHref(post, href)}
      className="flex items-center gap-2 px-3 py-2 mb-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 group"
    >
      {showRanking && <RankBadge index={index} small />}

      <span className="flex-1 truncate text-sm text-gray-800 group-hover:text-gray-900">
        <NewBadge createdAt={post.createdAt} />
        {display.title}
      </span>

      {showDate && (
        <span className="shrink-0 text-xs text-gray-400">
          <LocalTime dateString={post.createdAt} />
        </span>
      )}
    </Link>
  )
}