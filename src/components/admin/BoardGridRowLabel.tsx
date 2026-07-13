'use client'

import { useRowLabel } from '@payloadcms/ui'

export default function BoardGridRowLabel() {
  const { data, rowNumber } = useRowLabel<any>()

  const number =
    typeof rowNumber === 'number'
      ? String(rowNumber + 1).padStart(2, '0')
      : ''

  const title = data?.customTitle || 'Untitled'

  console.log('RowLabel data', data)

  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {number && <span>{number}</span>}
      <span>Board</span>
      <strong>{title}</strong>
    </span>
  )
}