'use client'

type SocialConfig = { enabled: boolean; buttonLabel?: string }

type Props = {
  google?: SocialConfig
  naver?: SocialConfig
  kakao?: SocialConfig
  facebook?: SocialConfig
  dividerText?: string
  redirect?: string
  mode?: 'login' | 'register'
  beforeRedirect?: () => Promise<void>
}

export default function SocialLoginButtons({
  google,
  naver,
  kakao,
  facebook,
  dividerText = 'or',
  redirect = '/',
  mode = 'login',
  beforeRedirect
}: Props) {
  const hasAnySocial = google?.enabled || naver?.enabled || kakao?.enabled || facebook?.enabled
  if (!hasAnySocial) return null

  const go = async (provider: string) => {
    sessionStorage.removeItem('manual_logout')
    
    if (beforeRedirect) {
      await beforeRedirect()
    }

    const params = new URLSearchParams()

    params.set('redirect', redirect)
    params.set('mode', mode)

    window.location.href = `/api/oauth/${provider}?${params.toString()}`
  }

  return (
    <div className="mt-4">
      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-400">{dividerText}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Google */}
        {google?.enabled && (
          <button
            onClick={() => go('google')}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {google.buttonLabel || 'Continue with Google'}
          </button>
        )}

        {/* Naver */}
        {naver?.enabled && (
          <button
            onClick={() => go('naver')}
            className="w-full flex items-center justify-center gap-3 bg-[#03C75A] rounded px-4 py-2.5 text-sm text-white hover:bg-[#02b351] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="white">
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
            </svg>
            {naver.buttonLabel || '네이버로 로그인'}
          </button>
        )}

        {/* Kakao */}
        {kakao?.enabled && (
          <button
            onClick={() => go('kakao')}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] rounded px-4 py-2.5 text-sm text-[#000000CC] hover:bg-[#f0d900] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#000000CC" d="M12 3C6.477 3 2 6.477 2 10.5c0 2.638 1.637 4.95 4.09 6.276-.18.675-.652 2.438-.745 2.813-.115.468.172.462.36.335.148-.1 2.35-1.585 3.302-2.228.647.09 1.313.137 1.993.137 5.523 0 10-3.477 10-7.833C22 6.477 17.523 3 12 3z"/>
            </svg>
            {kakao.buttonLabel || '카카오로 로그인'}
          </button>
        )}

        {/* Facebook */}
        {facebook?.enabled && (
          <button
            onClick={() => go('facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] rounded px-4 py-2.5 text-sm text-white hover:bg-[#166FE5] transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {facebook.buttonLabel || 'Continue with Facebook'}
          </button>
        )}
      </div>
    </div>
  )
}
