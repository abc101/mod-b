'use client'

import { useRowLabel } from '@payloadcms/ui'

export default function NavigationItemRowLabel() {
  const { data, rowNumber } = useRowLabel<any>()

  const number =
    typeof rowNumber === 'number'
      ? String(rowNumber + 1).padStart(2, '0')
      : ''

  const label = data?.label || 'Untitled'

  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {number && <span>{number}</span>}
      <span>Item</span>
      <strong>{label}</strong>
    </span>
  )
}
