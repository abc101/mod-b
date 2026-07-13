'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBox() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative">
      {/* Desktop: always visible */}
      <form onSubmit={handleSubmit} className="hidden md:flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-48 border border-gray-300 rounded-l px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:w-64 transition-all"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white px-3 py-1.5 rounded-r text-sm hover:bg-gray-700"
        >
          🔍
        </button>
      </form>

      {/* Mobile: icon toggle */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          aria-label="Search"
        >
          🔍
        </button>

        {open && (
          <div className="absolute right-0 top-11 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button
                type="submit"
                className="bg-gray-800 text-white px-3 py-2 rounded-r text-sm hover:bg-gray-700"
              >
                🔍
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
