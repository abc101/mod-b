'use client'

import { useRef, useState } from 'react'
import { submitComment } from './actions'
import AnonymousFields from '@/components/forms/AnonymousFields'
import TurnstileWidget from '@/components/forms/TurnstileWidget'
import { FEATURES } from '@/lib/config/features'

type Props = {
  postId: number
  boardSlug: string
  parentCommentId?: number
  onSuccess?: () => void
  isLoggedIn?: boolean
  allowAnonymousComment?: boolean
}

export default function CommentForm({
  postId,
  boardSlug,
  parentCommentId,
  onSuccess,
  isLoggedIn = false,
  allowAnonymousComment = false,
}: Props) {
  const [anonymousNickname, setAnonymousNickname] = useState('')
  const [anonymousPassword, setAnonymousPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const ref = useRef<HTMLFormElement>(null)

  const isAnonymousComment = !isLoggedIn && allowAnonymousComment
  const enableTurnstile =
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAnonymousComment && anonymousPassword.trim().length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    if (FEATURES.turnstile && isAnonymousComment && !turnstileToken) {
      setError('Captcha verification is required.')
      return
    }

    setSubmitting(true)
    setError('')
    setTurnstileToken('')

    const formData = new FormData(ref.current!)

    formData.set('postId', String(postId))
    formData.set('boardSlug', boardSlug)

    if (parentCommentId) {
      formData.set('parentCommentId', String(parentCommentId))
    }

    if (isAnonymousComment) {
      formData.set('anonymousNickname', anonymousNickname.trim())
      formData.set('anonymousPassword', anonymousPassword)
      formData.set('turnstileToken', turnstileToken)
    }

    try {
      await submitComment(formData)

      ref.current?.reset()
      setAnonymousNickname('')
      setAnonymousPassword('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to submit comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const [turnstileToken, setTurnstileToken] = useState('')

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="mt-6 bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {isAnonymousComment && (
        <AnonymousFields
          nickname={anonymousNickname}
          password={anonymousPassword}
          onNicknameChange={setAnonymousNickname}
          onPasswordChange={setAnonymousPassword}
        />
      )}

      {isAnonymousComment && (
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
        />
      )}

      <textarea
        name="content"
        placeholder="Write a comment..."
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
        required
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}