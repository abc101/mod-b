import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/Header/LogoutButton'
import LocalTime from '@/components/LocalTime'
import EmptyState from '@/components/EmptyState'
import { getRelation } from '@/lib/relations'

import type {
  User,
  Post,
  Comment,
  Board,
  Notification,
  BookmarkItem,
  LoginLog,
} from '@/types/payload'

export const dynamic = 'force-dynamic'

export default async function MyPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login?redirect=/my-page')
  
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
  }) as User

  // Fetch user's recent posts
  const posts = await payload.find({
    collection: 'posts',
    where: { author: { equals: user.id } },
    sort: '-createdAt',
    limit: 10,
    depth: 1,
  })

  // Fetch user's recent comments
  const comments = await payload.find({
    collection: 'comments',
    where: { author: { equals: user.id } },
    sort: '-createdAt',
    limit: 10,
    depth: 1,
  })

  const loginLogs = await payload.find({
    collection: 'login-logs',
    where: { user: { equals: user.id } },
    sort: '-createdAt',
    limit: 10,
    depth: 0,
  })

  const managedBoards = await payload.find({
    collection: 'boards',
    where: {
      managers: {
        contains: user.id,
      },
    },
  })

  const avatarUrl =
    getRelation(fullUser.avatar)?.url ??
    fullUser.socialAvatarUrl ??
    null

  const notifications = await payload.find({
    collection: 'notifications',
    where: {
      recipient: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit: 5,
    depth: 0,
    overrideAccess: true,
  })

  const bookmarkItems = await payload.find({
    collection: 'bookmark-items',
    where: {
      'folder.user': {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit: 5,
    depth: 2,
    overrideAccess: true,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">

            <div className="flex flex-col items-center text-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullUser.nickname || fullUser.name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover mb-4 border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-4">
                  {fullUser.nickname?.[0]?.toUpperCase() || fullUser.email[0].toUpperCase()}
                </div>
              )}
              <h2 className="font-semibold text-gray-900">{fullUser.nickname || fullUser.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <span
                className={`mt-2 text-xs px-2 py-0.5 rounded-full ${
                  fullUser.role
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {fullUser.role}
              </span>
            </div>
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Posts</span>
                <span className="font-medium">{posts.totalDocs}</span>
              </div>
              <div className="flex justify-between">
                <span>Comments</span>
                <span className="font-medium">{comments.totalDocs}</span>
              </div>
              <div className="flex justify-between">
                <span>Joined</span>
                <span className="font-medium">
                  <LocalTime dateString={fullUser.createdAt} />
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                href="/my-page/edit"
                className="block w-full text-center border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-100"
              >
                Edit Profile
              </Link>
              <LogoutButton className="block w-full text-center border border-red-200 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-50" />
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Recent posts */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Posts</h3>
              <span className="text-xs text-gray-400">{posts.totalDocs} total</span>
              <Link href="/my-page/posts" className="text-xs text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
              <ul className="divide-y divide-gray-100">
                {posts.docs.length === 0 ? (
                  <EmptyState as="li" message="No posts yet." />
                ) : (
                  posts.docs.map((post) => {
                    const board = getRelation(post.board)

                    return (
                      <li key={post.id}>
                        {post.isDeleted ? (
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 opacity-60">
                            <div className="flex items-center gap-2 truncate flex-1">
                              <span className="text-xs font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded shrink-0">
                                Deleted
                              </span>
                              <span className="text-sm text-gray-500 line-through truncate">
                                {post.title}
                              </span>
                            </div>

                            <span className="text-xs text-gray-400 ml-2 shrink-0">
                              {post.deletedAt ? (
                                <LocalTime dateString={post.deletedAt} />
                              ) : (
                                <LocalTime dateString={post.createdAt} />
                              )}
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={`/board/${encodeURIComponent(board?.slug ?? '')}/${post.id}`}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group"
                          >
                            <span className="text-sm text-gray-800 group-hover:text-gray-900 truncate flex-1">
                              {post.title}
                            </span>

                            <span className="text-xs text-gray-400 ml-2 shrink-0">
                              <LocalTime dateString={post.createdAt} />
                            </span>
                          </Link>
                        )}
                      </li>
                    )
                  })
                )}
              </ul>
          </div>

          {/* Recent comments */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">My Comments</h3>
              <span className="text-xs text-gray-400">{comments.totalDocs} total</span>
                <Link href="/my-page/comments" className="text-xs text-blue-600 hover:underline">
                  View All →
                </Link>
            </div>
              <ul className="divide-y divide-gray-100">
                {comments.docs.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-gray-400">
                    No comments yet.
                  </li>
                ) : (
                  comments.docs.map((comment) => {
                    const post = getRelation(comment.post)
                    const board = getRelation(post?.board)

                    return (
                      <li key={comment.id}>
                        <Link
                          href={`/board/${encodeURIComponent(board?.slug ?? '')}/${post?.id ?? ''}`}
                          className="flex items-start justify-between px-4 py-2.5 hover:bg-gray-50 group"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate flex-1">
                            {comment.content}
                          </span>

                          <span className="text-xs text-gray-400 ml-2 shrink-0">
                            <LocalTime dateString={comment.createdAt} />
                          </span>
                        </Link>
                      </li>
                    )
                  })
                )}
              </ul>
          </div>

          {/* Notification */}
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Notifications</h2>

              <Link
                href="/my-page/notifications"
                className="text-xs text-blue-600 hover:underline"
              >
                View all →
              </Link>
            </div>

            {notifications.docs.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">
                No notifications.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.docs.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/notification/${item.id}`}
                      className={`block px-4 py-3 hover:bg-gray-50 ${
                        item.isRead ? 'bg-white' : 'bg-blue-50/70'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {!item.isRead && (
                          <span className="text-blue-600 mr-1">●</span>
                        )}
                        {item.title}
                      </div>

                      {item.message && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.message}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bookmark */}
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Bookmarks
              </h2>

              <Link
                href="/my-page/bookmarks"
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>

            {bookmarkItems.docs.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">
                No bookmarks.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {bookmarkItems.docs.map((item) => {
                    const post = getRelation(item.post)
                    if (!post) return null

                    const board = getRelation(post.board)
                    const folder = getRelation(item.folder)

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/board/${encodeURIComponent(board?.slug ?? '')}/${post.id}`}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span>{folder?.name ?? 'Default'}</span>

                          {item.note && (
                            <>
                              <span>•</span>
                              <span className="line-clamp-1">
                                {item.note}
                              </span>
                            </>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Managed boards */}
          {managedBoards.docs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Managed Boards</h3>
                <span className="text-xs text-gray-400">{managedBoards.totalDocs} total</span>
              </div>

              <ul className="divide-y divide-gray-100">
                {managedBoards.docs.map((board) => (
                  <li key={board.id}>
                    <Link
                      href={`/board/${encodeURIComponent(board.slug)}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 group"
                    >
                      <span className="text-sm text-gray-800 group-hover:text-gray-900 truncate flex-1">
                        {board.name || board.slug}
                      </span>
                      <span className="text-xs text-gray-400 ml-2 shrink-0">
                        Manage
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent login logs */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Login History</h3>
              <span className="text-xs text-gray-400">{loginLogs.totalDocs} total</span>
              <Link href="/my-page/login-logs" className="text-xs text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <ul className="divide-y divide-gray-100">
              {loginLogs.docs.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-gray-400">
                  No login history yet.
                </li>
              ) : (
                loginLogs.docs.map((log) => (
                  <li key={log.id} className="px-4 py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-700">
                        <LocalTime dateString={log.createdAt} showTime />
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {log.ipAddress || 'unknown'}
                      </span>
                    </div>
                    {log.userAgent && (
                      <div className="mt-1 text-xs text-gray-400 truncate">
                        {log.userAgent}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
