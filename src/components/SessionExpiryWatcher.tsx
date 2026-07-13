'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const WARNING_SECONDS = 60

export default function SessionExpiryWatcher() {
  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const pathname = usePathname()

  const shouldSkip =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/admin')

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session-status', {
        cache: 'no-store',
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.authenticated) {
        if (data.reason === 'no_token') return

        const manualLogout = sessionStorage.getItem('manual_logout') === 'true'
        if (manualLogout) return

        if (data.reason === 'expired') {
          window.location.href = '/login?error=session_expired'
        }

        return
      }

      if (typeof data.remainingSeconds === 'number') {
        setRemaining(data.remainingSeconds)

        if (data.remainingSeconds <= WARNING_SECONDS) {
          setShowWarning(true)
        }
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (shouldSkip) return

    checkSession()

    const timer = setInterval(checkSession, 10000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!showWarning || remaining === null) return

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return prev

        if (prev <= 1) {
          window.location.href = '/login?error=session_expired'
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showWarning, remaining])

  const handleExtend = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/auth/extend-session', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        window.location.href = '/login?error=session_expired'
        return
      }

      setShowWarning(false)
      setRemaining(null)
      await checkSession()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout?redirect=/login'
  }

  if (!showWarning || remaining === null) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Session Expiring Soon
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          Your session will expire in{' '}
          <span className="font-semibold text-red-600">
            {remaining}
          </span>{' '}
          seconds.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleExtend}
            disabled={loading}
            className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Extending...' : 'Stay Logged In'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}