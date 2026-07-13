'use client'

import { useRowLabel } from '@payloadcms/ui'

export default function HeroSlideRowLabel() {
  const { data, rowNumber } = useRowLabel<any>()

  const number =
    typeof rowNumber === 'number'
      ? String(rowNumber + 1).padStart(2, '0')
      : ''

  const title = data?.title || data?.subtitle || 'Untitled'

  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {number && <span>{number}</span>}
      <span>Slide</span>
      <strong>{title}</strong>
    </span>
  )
}