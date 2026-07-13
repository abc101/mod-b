
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import EmptyState from '@/components/EmptyState'
import Pagination from '@/components/Pagination'
import { getDisplayPost } from '@/lib/post-display'
import {
  createBookmarkFolder,
  deleteBookmarkFolder,
  moveBookmarkItem,
} from './actions'
import type {
  BookmarkFolder,
  BookmarkItem,
  Post,
  Board,
} from '@/types/payload'
import { getRelation } from '@/lib/relations'

type BookmarkItemWithPost = BookmarkItem & {
  post?: (Post & {
    board?: Board | number | string | null
  }) | number | string | null
}

type Props = {
  searchParams: Promise<{
    page?: string
    folder?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function MyBookmarksPage({ searchParams }: Props) {
  const { page = '1', folder } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login?redirect=/my-page/bookmarks')
  }

  const folders = await payload.find({
    collection: 'bookmark-folders',
    where: {
      user: {
        equals: user.id,
      },
    },
    sort: 'order',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const selectedFolder =
    folders.docs.find((item) => String(item.id) === String(folder)) ||
    folders.docs.find((item) => item.isDefault) ||
    folders.docs[0]

  const bookmarkItems = selectedFolder
    ? await payload.find({
        collection: 'bookmark-items',
        where: {
          folder: {
            equals: selectedFolder.id,
          },
        },
        sort: '-createdAt',
        page: currentPage,
        limit: 20,
        depth: 2,
        overrideAccess: true,
      })
    : {
        docs: [],
        page: currentPage,
        totalPages: 1,
        totalDocs: 0,
      }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/my-page" className="hover:text-gray-900">
          My Page
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Bookmarks</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Folders</h2>
          </div>

          <div className="p-3 border-b border-gray-100">
            <form action={createBookmarkFolder} className="flex gap-2">
              <input
                name="name"
                placeholder="New folder"
                className="min-w-0 flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="shrink-0 bg-gray-900 text-white px-3 py-1.5 rounded text-xs hover:bg-gray-700"
              >
                Add
              </button>
            </form>
          </div>

          <ul className="divide-y divide-gray-100">
            {folders.docs.length === 0 ? (
              <li className="px-4 py-4 text-sm text-gray-400">
                No folders.
              </li>
            ) : (
              folders.docs.map((item) => {
                const active =
                  selectedFolder &&
                  String(selectedFolder.id) === String(item.id)

                return (
                  <li key={item.id}>
                    <div
                      className={`flex items-center justify-between gap-2 px-3 py-2 ${
                        active ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Link
                        href={`/my-page/bookmarks?folder=${item.id}`}
                        className="min-w-0 flex-1"
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        {item.isDefault && (
                          <div className="text-[11px] text-gray-400">
                            Default
                          </div>
                        )}
                      </Link>

                      {!item.isDefault && (
                        <form
                          action={async () => {
                            'use server'
                            await deleteBookmarkFolder(item.id)
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        </aside>

        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-gray-900">
                {selectedFolder?.name || 'Bookmarks'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {bookmarkItems.totalDocs} saved posts
              </p>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {bookmarkItems.docs.length === 0 ? (
              <EmptyState as="li" message="No bookmarks in this folder." />
            ) : (
              bookmarkItems.docs.map((item: BookmarkItemWithPost) => {
                const post = getRelation(item.post)
                if (!post) return null

                const board = getRelation(post.board)
                if (!board?.slug) return null

                const display = getDisplayPost(post)

                return (
                  <li key={item.id}>
                    <Link
                      href={`/board/${encodeURIComponent(board.slug)}/${post.id}`}
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
                        Saved <LocalTime dateString={item.createdAt} />
                      </div>
                    </Link>

                    <form
                      action={async (formData) => {
                        'use server'

                        const targetFolderId = Number(formData.get('targetFolderId'))

                        if (targetFolderId) {
                          await moveBookmarkItem(item.id, targetFolderId)
                        }
                      }}
                      className="mt-2"
                    >
                      <select
                        name="targetFolderId"
                        defaultValue={selectedFolder.id}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        {folders.docs.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            Move to {folder.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="ml-2 text-xs text-blue-600 hover:underline"
                      >
                        Move
                      </button>
                    </form>
                  </li>
                )
              })
            )}
          </ul>

          <Pagination
            basePath="/my-page/bookmarks"
            currentPage={bookmarkItems.page || currentPage}
            totalPages={bookmarkItems.totalPages || 1}
            search={
              selectedFolder ? `folder=${selectedFolder.id}` : undefined
            }
          />
        </section>
      </div>
    </div>
  )
}