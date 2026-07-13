export default function TopList({
  items,
  empty = 'No data.',
}: {
  items: { key: string | number; count: number }[]
  empty?: string
}) {
  if (items.length === 0) {
    return <div className="p-6 text-sm text-gray-400">{empty}</div>
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <li
          key={String(item.key)}
          className="flex justify-between px-4 py-3 text-sm"
        >
          <span className="text-gray-700">{String(item.key)}</span>
          <span className="font-semibold text-gray-900">{item.count}</span>
        </li>
      ))}
    </ul>
  )
}