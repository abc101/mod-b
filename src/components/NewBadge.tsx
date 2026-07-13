type Props = {
  createdAt: string
  hours?: number
}

export default function NewBadge({
  createdAt,
  hours = 72,
}: Props) {
  const created = new Date(createdAt).getTime()
  const now = Date.now()

  const isNew = now - created < hours * 60 * 60 * 1000

  if (!isNew) return null

  return (
    <span className="mr-2 inline-block rounded bg-red-600 px-1 py-[1px] text-[9px] leading-none font-bold text-white -rotate-6 overflow-visible">
      NEW
    </span>
  )
}