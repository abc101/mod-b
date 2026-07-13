import type { ReactNode } from 'react'

type Props = {
  displayType: 'list' | 'card' | 'gallery' | 'compact'
  gridColumns?: '1' | '2' | '3' | '4'
  children: ReactNode
}

function getGridClass(columns: Props['gridColumns'] = '3') {
  if (columns === '1') return 'grid-cols-1'
  if (columns === '2') return 'grid-cols-1 md:grid-cols-2'
  if (columns === '4') return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
}

export default function PostGrid({
  displayType,
  gridColumns = '3',
  children,
}: Props) {
  if (displayType === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {children}
        </ul>
      </div>
    )
  }

  if (displayType === 'compact') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className={`grid ${getGridClass(gridColumns)} gap-2 p-2`}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`grid ${getGridClass(gridColumns)} gap-4`}>
      {children}
    </div>
  )
}