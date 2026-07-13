'use client'

import { useEffect, useState } from 'react'

type Props = {
  dateString: string
  showTime?: boolean
}

export default function LocalTime({
  dateString,
  showTime = false,
}: Props) {
  const [formattedTime, setFormattedTime] = useState('')

  useEffect(() => {
    const date = new Date(dateString)

    const local = showTime
      ? date.toLocaleString()     
      : date.toLocaleDateString()

    setFormattedTime(local)
  }, [dateString, showTime])

  return <span suppressHydrationWarning>{formattedTime || '...'}</span>
}