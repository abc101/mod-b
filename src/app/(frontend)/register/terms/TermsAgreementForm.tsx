'use client'

import { useState } from 'react'
import Link from 'next/link'
import SocialLoginButtons from '@/components/SocialLoginButtons'
import { RichText } from '@payloadcms/richtext-lexical/react'

type SocialConfig = { enabled: boolean; buttonLabel?: string }

type Props = {
  termsPage?: {
    title?: string
    content?: any
    contentHtml?: string | null
  } | null

  socialSettings?: {
    google?: SocialConfig
    naver?: SocialConfig
    kakao?: SocialConfig
    facebook?: SocialConfig
    dividerText?: string
  }
  urlError?: string | null
}

export default function TermsAgreementForm({ socialSettings, termsPage, urlError }: Props) {
  
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const errorMessages: Record<string, string> = {
    social_account_not_found:
      'No account was found for this social login. Please agree to the terms and register first.',
    terms_required: 'Please agree to the terms before registering.',
  }

  const acceptTerms = async () => {
    const res = await fetch('/api/register/accept-terms', {
      method: 'POST',
    })

    if (!res.ok) {
      throw new Error('Failed to accept terms.')
    }
  }

  const handleContinueEmail = async () => {
    if (!agreed || loading) return

    setLoading(true)

    try {
      await acceptTerms()
      window.location.href = '/register/email'
    } catch {
      alert('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Create an account
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Please review and agree to the terms before registering.
      </p>

      {urlError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
          {errorMessages[urlError] || 'Please complete registration first.'}
        </div>
      )}

      <label className="flex items-start gap-2 text-sm text-gray-700 mb-4">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          I agree to the{' '}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-blue-600 hover:underline"
          >
            Terms of Service
          </button>
          .
        </span>
      </label>

      <button
        type="button"
        onClick={handleContinueEmail}
        disabled={!agreed || loading}
        className={`w-full py-2.5 rounded text-sm font-medium ${
          agreed
            ? 'bg-gray-900 text-white hover:bg-gray-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue with Email
      </button>

      {agreed && (
        <SocialLoginButtons
          google={socialSettings?.google}
          naver={socialSettings?.naver}
          kakao={socialSettings?.kakao}
          facebook={socialSettings?.facebook}
          dividerText="or register with"
          redirect="/"
          mode="register"
          beforeRedirect={acceptTerms}
        />
      )}

      {!agreed && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Please agree to the terms to continue with social registration.
        </p>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-lg font-semibold mb-3">Terms of Service</h2>

            <div className="max-h-80 overflow-y-auto text-sm text-gray-700">
              {termsPage ? (
                termsPage.contentHtml ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: termsPage.contentHtml,
                    }}
                  />
                ) : termsPage.content ? (
                  <RichText data={termsPage.content} />
                ) : (
                  <div className="text-gray-500">
                    This Terms of Service page does not contain any content.
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium">Terms of Service page not found.</p>
                  <p className="mt-2 text-sm">
                    Please create a page with the slug{' '}
                    <code className="mx-1 rounded bg-gray-100 px-1 py-0.5">
                      terms-of-service
                    </code>{' '}
                    in the admin panel.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-5 w-full bg-gray-900 text-white py-2 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}