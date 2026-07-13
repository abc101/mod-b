'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Calling the default Payload CMS forgot-password endpoint
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Email Sent</h2>
        <p className="text-gray-600">
          If an account exists with that email, we have sent a password reset link. Please check your inbox.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#111827] focus:border-[#111827]"
            placeholder="Enter your registered email"
          />
        </div>
        
        {status === 'error' && (
          <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex justify-center py-2 px-4 border-transparent rounded-md shadow-sm bg-[var(--color-primary)] text-[var(--color-primary-fg)] px-3 py-1 text-sm hover:opacity-90"
        >
          {status === 'loading' ? 'Processing...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}