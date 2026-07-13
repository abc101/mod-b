'use client'

import { useEffect, useRef } from 'react'
import { incrementViewCount } from './actions'

type Props = {
  postId: number
  currentCount: number
}

export default function ViewCountUpdater({ postId, currentCount }: Props) {
  const isIncremented = useRef(false)

  useEffect(() => {
    // Prevent multiple increments if the component re-renders
    if (!isIncremented.current) {
      isIncremented.current = true
      incrementViewCount(postId, currentCount)
    }
  }, [postId, currentCount])

  return null // This component does not render anything visible
}