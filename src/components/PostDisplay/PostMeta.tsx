import type { PostDisplayPost } from './types'
import UserDisplay from '@/components/UserDisplay'
import LocalTime from '@/components/LocalTime'

type Props = {
  post: PostDisplayPost
  showAuthor?: boolean
  showDate?: boolean
  showViewCount?: boolean
}

export default function PostMeta({
  post,
  showAuthor = true,
  showDate = true,
  showViewCount = true,
}: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400">
      {showAuthor && (
        <UserDisplay user={post.author} anonymousAuthor={post.anonymousAuthor ?? undefined} link={false} />
      )}
      {showViewCount && <span>👁 {post.viewCount || 0}</span>}
      {showDate && <LocalTime dateString={post.createdAt} />}
    </div>
  )
}