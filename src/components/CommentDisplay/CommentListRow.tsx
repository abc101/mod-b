import type { Comment, Post, Board } from '@/types/payload'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import UserDisplay from '@/components/UserDisplay'

type CommentListRowComment = Comment & {
  post?: (Post & {
    board?: Board | number | string | null
  }) | number | string | null
}

type Props = {
  comment: CommentListRowComment
  showBoardName?: boolean
  showAuthor?: boolean
  showDate?: boolean
}

export default function CommentListRow({
  comment,
  showBoardName = true,
  showAuthor = true,
  showDate = true,
}: Props) {
  const post = comment.post && typeof comment.post === 'object'
    ? comment.post
    : null

  const board = post?.board && typeof post.board === 'object'
    ? post.board
    : null
    
  if (!post || !board) return null

  const href = `/board/${encodeURIComponent(board.slug)}/${post.id}`

  return (
    <li>
      <Link
        href={href}
        className="block px-4 py-3 hover:bg-gray-50 group"
      >
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          {showBoardName && (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {board.name}
            </span>
          )}

          <span className="truncate text-gray-500">
            {post.title}
          </span>
        </div>

        <p className="text-sm text-gray-800 line-clamp-2 group-hover:text-gray-900">
          {comment.content}
        </p>

        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
          {showAuthor && (
            <span>
              <UserDisplay
                user={comment.author}
                anonymousAuthor={comment.anonymousAuthor ?? undefined}
                link={false}
              />
            </span>
          )}

          {showDate && (
            <span>
              <LocalTime dateString={comment.createdAt} />
            </span>
          )}
        </div>
      </Link>
    </li>
  )
}