'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LocalTime from '@/components/LocalTime'

type AnnouncementItem = {
  id: number
  title: string
  message?: string
  href?: string | null
  linkTarget?: '_self' | '_blank'
  startDate?: string
}

type Props = {
  title?: string
  items: AnnouncementItem[]
  intervalMs?: number
  width?: 'content' | 'full'
}

export default function AnnouncementTickerClient({
  title = 'Announcement',
  items,
  intervalMs = 4000,
  width = 'content',
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shouldRotate = items.length > 1

  useEffect(() => {
    if (!mounted || !shouldRotate) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [mounted, shouldRotate, items.length, intervalMs])

  if (!mounted || !items.length) return null

  const item = items[index]

  const tickerItemClass = shouldRotate
    ? 'flex h-9 items-center animate-notice-slide-up'
    : 'flex h-9 items-center'

  const inner = (
    <>
      <div className="flex-1 min-w-0 text-center px-4">
        <span className="block truncate text-sm text-gray-800">
          <span className="font-medium">{item.title}</span>
          {item.message && (
            <span className="text-gray-500"> : {item.message}</span>
          )}
        </span>
      </div>

      {item.startDate && (
        <span className="shrink-0 text-xs text-gray-400">
          <LocalTime dateString={item.startDate} />
        </span>
      )}
    </>
  )

  return (
    <section className="border-b border-blue-100 bg-blue-50">
      <div
        className={
          width === 'full'
            ? 'w-full px-4'
            : 'mx-auto w-full max-w-[var(--max-width)] px-4'
        }
      >
        <div className="flex items-center h-9 gap-3 overflow-hidden">
          <div className="shrink-0 text-xs font-semibold text-blue-700 flex items-center">
            <span>📢</span>
            <span className="hidden sm:inline ml-1">{title}</span>
          </div>

          <div className="relative flex-1 h-9 overflow-hidden">
            {item.href ? (
              <Link
                key={item.id}
                href={item.href}
                target={item.linkTarget}
                className={`${tickerItemClass} cursor-pointer hover:underline`}
              >
                {inner}
              </Link>
            ) : (
              <div key={item.id} className={tickerItemClass}>
                {inner}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}