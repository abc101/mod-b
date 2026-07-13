import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

import Pagination from '@/components/Pagination'
import EmptyState from '@/components/EmptyState'
import LocalTime from '@/components/LocalTime'
import {
  PostGrid,
  PostListRow,
} from '@/components/PostDisplay'

import { getUserById } from '@/lib/services/users'
import { getPostsByAuthor } from '@/lib/services/posts'
import { getCommentsByAuthor } from '@/lib/services/comments'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    postsPage?: string
    commentsPage?: string
  }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const user = await getUserById({
    payload,
    id,
    depth: 0,
  }) as any

  if (!user) return {}

  return {
    title: user.nickname || user.name || 'User',
  }
}

export default async function UserPage({ params, searchParams }: Props) {
  const { id } = await params
  const { postsPage = '1', commentsPage = '1' } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const user = await getUserById({
    payload,
    id,
    depth: 0,
  }) as any

  if (!user) notFound()

  const currentPostsPage = Math.max(1, Number(postsPage) || 1)
  const currentCommentsPage = Math.max(1, Number(commentsPage) || 1)

  const posts = await getPostsByAuthor({
    payload,
    authorId: user.id,
    page: currentPostsPage,
    limit: 10,
    depth: 2,
  })

  const comments = await getCommentsByAuthor({
    payload,
    authorId: user.id,
    page: currentCommentsPage,
    limit: 10,
    depth: 2,
  })

  const displayName = user.nickname || user.name || 'User'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{displayName}</span>
      </nav>

      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {displayName}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {user.role && <span>{user.role}</span>}
          {user.createdAt && (
            <span>
              Joined <LocalTime dateString={user.createdAt} />
            </span>
          )}
        </div>

        {user.bio && (
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
            {user.bio}
          </p>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Posts
          </h2>
          <span className="text-xs text-gray-400">
            {posts.totalDocs} total
          </span>
        </div>

        {posts.docs.length === 0 ? (
          <EmptyState message="No posts yet." />
        ) : (
          <>
            <PostGrid displayType="list">
              {posts.docs.map((post: any, index: number) => (
                <PostListRow
                  key={post.id}
                  post={post}
                  index={index}
                  showRanking={false}
                  showBoardName
                  showAuthor={false}
                  showDate
                  showViewCount
                />
              ))}
            </PostGrid>

            <Pagination
              basePath={`/user/${user.id}`}
              currentPage={posts.page || currentPostsPage}
              totalPages={posts.totalPages || 1}
              query={{
                commentsPage: currentCommentsPage,
              }}
            />
          </>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Comments
          </h2>
          <span className="text-xs text-gray-400">
            {comments.totalDocs} total
          </span>
        </div>

        {comments.docs.length === 0 ? (
          <EmptyState message="No comments yet." />
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {comments.docs.map((comment: any) => {
                  const post = comment.post
                  const boardSlug = post?.board?.slug
                  const postId = post?.id || post

                  return (
                    <li key={comment.id}>
                      <Link
                        href={
                          boardSlug
                            ? `/board/${encodeURIComponent(boardSlug)}/${postId}`
                            : '#'
                        }
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        <p className="text-sm text-gray-800 line-clamp-2">
                          {comment.content}
                        </p>

                        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-400">
                          <span className="truncate">
                            {post?.title ? `On: ${post.title}` : 'Post'}
                          </span>
                          <LocalTime dateString={comment.createdAt} />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            <Pagination
              basePath={`/user/${user.id}`}
              currentPage={comments.page || currentCommentsPage}
              totalPages={comments.totalPages || 1}
              query={{
                postsPage: currentPostsPage,
                commentsPage: undefined,
              }}
            />
          </>
        )}
      </section>
    </div>
  )
}