'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SocialLoginButtons from '@/components/SocialLoginButtons'

type Props = {
  socialSettings?: {
    google?: { enabled: boolean; buttonLabel?: string }
    naver?: { enabled: boolean; buttonLabel?: string }
    kakao?: { enabled: boolean; buttonLabel?: string }
    facebook?: { enabled: boolean; buttonLabel?: string }
    dividerText?: string
  }
}

export default function LoginForm({ socialSettings }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const errorMessages: Record<string, string> = {
    user_not_found: 'No account was found with this email.',
    auth_failed: 'Incorrect email or password.',
    server_error: 'Server error. Please try again.',
    social_login_only:
      'This account was created with social login. Please sign in using the social login button.',
    account_deleted: 'This account has been deleted.',
    account_disabled: 'This account is disabled. Please contact the administrator.',
    email_account_exists:
      'This email is already registered with an email/password account. Please log in with your password first.',
    different_social_provider:
      'This email is registered with a different social login provider.',
    social_account_not_found:
      'No account was found for this social login. Please register first.',
    google_callback_failed: 'Google login failed. Please try again.',
    naver_callback_failed: 'Naver login failed. Please try again.',
    kakao_callback_failed: 'Kakao login failed. Please try again.',
    facebook_callback_failed: 'Facebook login failed. Please try again.',
    session_expired: 'Your session has expired. Please log in again.',
  }

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload()
        return
      }

      setCheckingAuth(false)
      setLoading(false)
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!res.ok) {
          setCheckingAuth(false)
          return
        }

        const data = await res.json()

        if (data?.user) {
          window.location.replace(redirect)
          return
        }

        setCheckingAuth(false)
      } catch (err) {
        console.error(err)
        setCheckingAuth(false)
      }
    }

    checkLoginStatus()
  }, [redirect])

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-gray-500 animate-pulse">One moment please...</p>
      </div>
    )
  }

  const urlError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (res.ok) {
        sessionStorage.removeItem('manual_logout')
        
        router.refresh()
        window.location.href = redirect
        return
      }

      const serverMessage =
        data?.message ||
        data?.error ||
        data?.errors?.[0]?.message

      const normalizedKey =
        typeof serverMessage === 'string'
          ? serverMessage.toLowerCase().replace(/\s+/g, '_')
          : ''

      if (normalizedKey === 'social_login_only') {
        const providerMap: Record<string, string> = {
          google: 'Google',
          naver: 'Naver',
          kakao: 'Kakao',
          facebook: 'Facebook',
        }

        const providerName = providerMap[data?.provider] || 'social login'

        setError(
          `This account was registered using ${providerName}. Please sign in with ${providerName}.`,
        )
        setLoading(false)
        return
      }

      setError(
        errorMessages[normalizedKey] ||
          serverMessage ||
          'Invalid email or password.',
      )
      setLoading(false)
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login</h1>

          <p className="text-sm text-gray-500 mb-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>

          {(error || urlError) && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
              {error || errorMessages[urlError!] || 'An error occurred.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <SocialLoginButtons
            google={socialSettings?.google}
            naver={socialSettings?.naver}
            kakao={socialSettings?.kakao}
            facebook={socialSettings?.facebook}
            dividerText={socialSettings?.dividerText}
            redirect={redirect}
            mode="login"
          />

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}