import type { Post, Board } from '@/types/payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import Pagination from '@/components/Pagination'
import EmptyState from '@/components/EmptyState'
import { getPostsByAuthor } from '@/lib/services/posts'

type MyPost = Post & {
  board?: Board | number | string | null
}

type PostStatus = 'published' | 'draft' | 'deleted'

type Props = {
  searchParams: Promise<{
    page?: string
    status?: PostStatus
  }>
}

export const dynamic = 'force-dynamic'

const tabs: { label: string; value: PostStatus }[] = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Deleted', value: 'deleted' },
]

export default async function MyPostsPage({ searchParams }: Props) {
  const { page = '1', status = 'published' } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const currentStatus: PostStatus =
    status === 'draft' || status === 'deleted' ? status : 'published'

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login?redirect=/my-page/posts')

  const posts = await getPostsByAuthor({
    payload,
    authorId: user.id,
    page: currentPage,
    limit: 20,
    status: currentStatus,
    includeDeleted: currentStatus === 'deleted',
    depth: 1,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/my-page" className="hover:text-gray-900">
          My Page
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">My Posts</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">My Posts</h1>
          <span className="text-xs text-gray-400">{posts.totalDocs} total</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/my-page/posts?status=${tab.value}`}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                currentStatus === tab.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <ul className="divide-y divide-gray-100">
          {posts.docs.length === 0 ? (
            <EmptyState
              as="li"
              message={
                currentStatus === 'draft'
                  ? 'No drafts yet.'
                  : currentStatus === 'deleted'
                    ? 'No deleted posts.'
                    : 'No posts yet.'
              }
            />
          ) : (
            posts.docs.map((post: MyPost) => {
              const board =
                post.board && typeof post.board === 'object'
                  ? post.board
                  : null

              const boardSlug = board?.slug ?? ''
              const isDeleted = post.isDeleted || post.status === 'deleted'
              const isDraft = post.status === 'draft'

              const href = isDraft
                ? `/board/${encodeURIComponent(boardSlug)}/${post.id}/edit`
                : `/board/${encodeURIComponent(boardSlug)}/${post.id}`

              return (
                <li key={post.id}>
                  {isDeleted ? (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 opacity-60">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded shrink-0">
                          Deleted
                        </span>
                        <span className="text-sm text-gray-500 line-through truncate">
                          {post.title}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400 ml-2 shrink-0">
                        <LocalTime dateString={post.deletedAt || post.createdAt} />
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isDraft && (
                          <span className="text-xs font-bold px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded shrink-0">
                            Draft
                          </span>
                        )}

                        <span className="text-sm text-gray-800 group-hover:text-gray-900 truncate">
                          {post.title || 'Untitled draft'}
                        </span>
                      </div>

                      <span className="text-xs text-gray-400 ml-2 shrink-0">
                        <LocalTime dateString={post.updatedAt || post.createdAt} />
                      </span>
                    </Link>
                  )}
                </li>
              )
            })
          )}
        </ul>
      </div>

      <Pagination
        basePath="/my-page/posts"
        currentPage={posts.page || currentPage}
        totalPages={posts.totalPages || 1}
        search={`status=${currentStatus}`}
      />
    </div>
  )
}