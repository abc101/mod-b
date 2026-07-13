import Link from 'next/link'

type Props = {
  title: string
  description?: string
  search?: string
  showSearch?: boolean
  showWrite?: boolean
  writeHref?: string
  backHref?: string
  backLabel?: string
}

export default function BoardHeader({
  title,
  description,
  search,
  showSearch = true,
  showWrite = false,
  writeHref,
  backHref,
  backLabel = 'Back',
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← {backLabel}
            </Link>
          )}

          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {showSearch && (
          <form method="GET" className="flex">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search..."
              className="border border-gray-300 rounded-l px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />

            <button
              type="submit"
              className="bg-gray-800 text-white px-3 py-1.5 rounded-r text-sm hover:bg-gray-700"
            >
              Search
            </button>
          </form>
        )}

        {showWrite && writeHref && (
          <Link
            href={writeHref}
            className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-700 whitespace-nowrap"
          >
            Write
          </Link>
        )}
      </div>
    </div>
  )
}