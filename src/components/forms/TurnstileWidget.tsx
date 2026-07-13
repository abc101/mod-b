'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { FEATURES } from '@/lib/config/features'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        },
      ) => string
      reset: (widgetId?: string) => void
    }
  }
}

type Props = {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export default function TurnstileWidget({ onVerify, onExpire }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!FEATURES.turnstile) return
    if (!siteKey || !ref.current || !window.turnstile) return
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onVerify,
      'expired-callback': () => onExpire?.(),
      'error-callback': () => onExpire?.(),
    })
  }, [siteKey, onVerify, onExpire])

  if (!FEATURES.turnstile || !siteKey) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div ref={ref} />
    </>
  )
}