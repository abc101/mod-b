'use client'

import { useState } from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: (password: string) => Promise<void>
}

export default function AnonymousPasswordDialog({
  open,
  title = 'Enter Password',
  message = 'Please enter the password for this post.',
  confirmLabel = 'Confirm',
  onClose,
  onConfirm,
}: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError('Password is required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onConfirm(password)
      setPassword('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Incorrect password.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-xl p-5 space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {message}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          placeholder="Password"
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? 'Checking...' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
