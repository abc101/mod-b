import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import { getDisplayPost } from '@/lib/post-display'

type Props = {
  params: Promise<{
    nickname: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: Props) {
  const { nickname } = await params

  const payload = await getPayload({
    config: configPromise,
  })

  const users = await payload.find({
    collection: 'users',
    where: {
      nickname: {
        equals: nickname,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const user = users.docs[0] as any

  if (!user) {
    notFound()
  }

  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { author: { equals: user.id } },
        { status: { equals: 'published' } },
        { isDeleted: { not_equals: true } },
        { isSecret: { not_equals: true } },
      ],
    },
    sort: '-createdAt',
    limit: 10,
    depth: 1,
    overrideAccess: true,
  })

  const comments = await payload.find({
    collection: 'comments',
    where: {
      and: [
        { author: { equals: user.id } },
        { isDeleted: { not_equals: true } },
      ],
    },
    sort: '-createdAt',
    limit: 10,
    depth: 1,
    overrideAccess: true,
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name || user.nickname || user.email}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              @{user.nickname}
            </p>

            {user.createdAt && (
              <p className="text-xs text-gray-400 mt-3">
                Joined <LocalTime dateString={user.createdAt} />
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <div className="text-xl font-bold text-gray-900">
                {posts.totalDocs}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>

            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <div className="text-xl font-bold text-gray-900">
                {comments.totalDocs}
              </div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Posts</h2>
          </div>

          {posts.docs.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">
              No public posts.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {posts.docs.map((post: any) => {
                const boardSlug = post.board?.slug
                const display = getDisplayPost(post)

                return (
                  <li key={post.id}>
                    <Link
                      href={`/board/${encodeURIComponent(boardSlug)}/${post.id}`}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {display.title}
                      </div>

                      {display.excerpt && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {display.excerpt}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        <LocalTime dateString={post.createdAt} />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Comments</h2>
          </div>

          {comments.docs.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">
              No public comments.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {comments.docs.map((comment: any) => {
                const post = comment.post
                const boardSlug = post?.board?.slug

                return (
                  <li key={comment.id}>
                    <Link
                      href={
                        boardSlug && post?.id
                          ? `/board/${encodeURIComponent(boardSlug)}/${post.id}`
                          : '#'
                      }
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="text-sm text-gray-800 line-clamp-2">
                        {comment.content}
                      </div>

                      {post?.title && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          on {post.title}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        <LocalTime dateString={comment.createdAt} />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}