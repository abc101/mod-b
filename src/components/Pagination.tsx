import Link from 'next/link'

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
  search?: string
  query?: Record<string, string | number | undefined>
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  search,
  query = {},
}: Props) {
  if (totalPages <= 1) return null

  const buildHref = (page: number) => {
    const params = new URLSearchParams()

    params.set('page', String(page))

    if (search) {
      params.set('search', search)
    }

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      }
    })

    return `${basePath}?${params.toString()}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex justify-center gap-1 mt-6">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          ‹
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`px-3 py-1.5 text-sm border rounded ${
            p === currentPage
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          {p}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          ›
        </Link>
      )}
    </div>
  )
}