import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { unifiedSearch } from '@/lib/community/server'
import EmptyState from '@/components/EmptyState'
import LocalTime from '@/components/LocalTime'

type Props = {
  searchParams: Promise<{
    q?: string
  }>
}

export const dynamic = 'force-dynamic'

const typeLabels: Record<string, string> = {
  post: 'Post',
  comment: 'Comment',
  user: 'User',
  board: 'Board',
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const payload = await getPayload({
    config: configPromise,
  })

  const results = query
    ? await unifiedSearch({
        payload,
        query,
        limit: 8,
      })
    : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Search
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        {query
          ? `Search results for "${query}"`
          : 'Enter a keyword to search posts, comments, users, and boards.'}
      </p>

      <form action="/search" className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search..."
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        />

        <button
          type="submit"
          className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {!query ? (
          <EmptyState message="No search keyword." />
        ) : results.length === 0 ? (
          <EmptyState message="No results found." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link
                  href={item.href}
                  className="block px-4 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold rounded bg-gray-100 text-gray-600 px-2 py-0.5">
                      {typeLabels[item.type] || item.type}
                    </span>

                    {item.createdAt && (
                      <span className="text-xs text-gray-400">
                        <LocalTime dateString={item.createdAt} />
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-gray-900">
                    {item.title}
                  </div>

                  {item.excerpt && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.excerpt}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}