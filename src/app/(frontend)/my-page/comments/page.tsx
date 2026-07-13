import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import Pagination from '@/components/Pagination'
import EmptyState from '@/components/EmptyState'
import { getCommentsByAuthor } from '@/lib/services/comments'
import type { Comment, Post, Board } from '@/types/payload'
import { getRelation } from '@/lib/relations'

type MyComment = Comment & {
  post?: (Post & {
    board?: Board | number | string | null
  }) | number | string | null
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export const dynamic = 'force-dynamic'

export default async function MyCommentsPage({ searchParams }: Props) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login?redirect=/my-page/comments')

  const comments = await getCommentsByAuthor({
    payload,
    authorId: user.id,
    page: currentPage,
    limit: 20,
    includeDeleted: true,
    depth: 2,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/my-page" className="hover:text-gray-900">My Page</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">My Comments</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">My Comments</h1>
          <span className="text-xs text-gray-400">{comments.totalDocs} total</span>
        </div>

        <ul className="divide-y divide-gray-100">
          {comments.docs.length === 0 ? (
            <EmptyState as="li" message="No comments yet." />
          ) : (
            comments.docs.map((comment: MyComment) => {
              const post = getRelation(comment.post)
              if (!post) return null

              const board = getRelation(post.board)
              if (!board?.slug) return null

              const boardSlug = board?.slug
              const postId = post?.id
              
              const isDeleted = comment.isDeleted

              return (
                <li key={comment.id}>
                  <Link
                    href={boardSlug ? `/board/${encodeURIComponent(boardSlug)}/${postId}` : '#'}
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm truncate flex-1 ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {isDeleted ? 'Deleted comment' : comment.content}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        <LocalTime dateString={comment.createdAt} />
                      </span>
                    </div>

                    {post?.title && (
                      <div className="mt-1 text-xs text-gray-400 truncate">
                        On: {post.title}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </div>

      <Pagination
        basePath="/my-page/comments"
        currentPage={comments.page || currentPage}
        totalPages={comments.totalPages || 1}
      />
    </div>
  )
}