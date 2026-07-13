import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'

export function getClientIp(headers: Headers | ReadonlyHeaders) {
  const forwardedFor = headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function getUserAgent(headers: Headers | ReadonlyHeaders) {
  return headers.get('user-agent') || ''
}