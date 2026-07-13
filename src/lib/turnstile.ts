import { FEATURES } from '@/lib/config/features'

export async function verifyTurnstileToken(token?: string | null) {
  if (!FEATURES.turnstile) {
    return true
  }

  if (!token) {
    throw new Error('Captcha verification is required.')
  }

  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    throw new Error('Turnstile secret key is not configured.')
  }

  const formData = new FormData()
  formData.append('secret', secret)
  formData.append('response', token)

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: formData,
    },
  )

  const data = await res.json()

  if (!data.success) {
    throw new Error('Captcha verification failed.')
  }

  return true
}