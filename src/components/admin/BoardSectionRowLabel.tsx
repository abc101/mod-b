'use client'

import { useRowLabel } from '@payloadcms/ui'

export default function BoardSectionRowLabel() {
  const { data, rowNumber } = useRowLabel<any>()

  const number =
    typeof rowNumber === 'number'
      ? String(rowNumber + 1).padStart(2, '0')
      : ''

  const typeLabel =
    data?.sectionType === 'latest'
      ? 'Latest Posts'
      : data?.sectionType === 'trending'
        ? 'Trending Posts'
        : data?.sectionType == 'popular'
          ? 'Popular Posts'
          : data?.sectionType === 'recentComments'
            ? 'Recent Comments'
            : data?.sectionType === 'board'
              ? 'Board'
              : data?.sectionType === 'page'
                ? 'Page Link'
                : data?.sectionType === 'custom'
                  ? 'Custom Link'
                  : data?.sectionType === 'advertisement'
                    ? 'Advertisement'
                    : 'Section'

  const title = data?.sectionTitle || 'Untitled'

  return (
    <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {number && <span>{number}</span>}
      <span>{typeLabel}</span>
      <strong>{title}</strong>
    </span>
  )
}