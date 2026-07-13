import bcrypt from 'bcrypt'

export async function hashAnonymousPassword(password: string) {
  return bcrypt.hash(password.trim(), 10)
}

export async function verifyAnonymousPassword({
  password,
  passwordHash,
}: {
  password?: string | null
  passwordHash?: string | null
}) {
  if (!password?.trim()) return false
  if (!passwordHash) return false

  return bcrypt.compare(password.trim(), passwordHash)
}

export function validateAnonymousPassword(password?: string | null) {
  const value = password?.trim() || ''

  if (value.length < 4) {
    throw new Error('Password must be at least 4 characters.')
  }

  return value
}