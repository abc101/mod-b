export default function TagList({
  items,
}: {
  items: { key: string | number; count: number }[]
}) {
  if (items.length === 0) {
    return <div className="p-6 text-sm text-gray-400">No tags.</div>
  }

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {items.map((item) => (
        <span
          key={String(item.key)}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
        >
          #{String(item.key)} {item.count}
        </span>
      ))}
    </div>
  )
}