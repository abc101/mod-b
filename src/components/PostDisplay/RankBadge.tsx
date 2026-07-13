export default function RankBadge({ index, small = false }: { index: number; small?: boolean }) {
  const size = small ? 'h-7 w-7 text-sm' : 'h-10 w-10 text-lg'

  const color =
    index === 0
      ? 'bg-yellow-500 text-white border-yellow-600'
      : index === 1
        ? 'bg-slate-700 text-white border-slate-800'
        : index === 2
          ? 'bg-amber-600 text-white border-amber-700'
          : 'bg-gray-100 text-gray-700 border-gray-300'

  return (
    <span className={`${size} ${color} inline-flex shrink-0 items-center justify-center rounded-full border font-black shadow-sm leading-none`}>
      {index + 1}
    </span>
  )
}