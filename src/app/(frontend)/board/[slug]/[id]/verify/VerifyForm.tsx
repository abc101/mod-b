'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { verifyAnonymousPostPassword } from '../anonymous-actions'

type Props = {
  postId: number
  nextPath: string
}

export default function VerifyForm({
  postId,
  nextPath,
}: Props) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError('Password is required.')
      return
    }

    setError('')

    startTransition(async () => {
      try {
        await verifyAnonymousPostPassword(postId, password)
        router.replace(nextPath)
        router.refresh()
      } catch (err: any) {
        setError(err.message || 'Incorrect password.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? 'Checking...' : 'Continue'}
      </button>
    </form>
  )
}