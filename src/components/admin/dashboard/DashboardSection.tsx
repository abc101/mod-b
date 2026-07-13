import Link from 'next/link'
import type { ReactNode } from 'react'

export default function DashboardSection({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
        <h2 className="font-semibold text-gray-900">{title}</h2>

        {href && (
          <Link href={href} className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        )}
      </div>

      {children}
    </section>
  )
}