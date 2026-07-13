import Link from 'next/link'

export default function QuickLinks({
  items,
}: {
  items: { label: string; href: string }[]
}) {
  return (
    <div className="grid gap-2 p-4 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}