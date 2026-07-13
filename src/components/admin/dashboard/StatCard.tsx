import Link from 'next/link'

export default function StatCard({
  label,
  value,
  href,
}: {
  label: string
  value: number | string
  href?: string
}) {
  const content = (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}