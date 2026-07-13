import crypto from 'crypto'

type AccessType = 'post' | 'comment'
type AccessMap = Record<string, string>

function getSecret() {
  return process.env.AUTH_SECRET || process.env.PAYLOAD_SECRET || 'dev-secret'
}

export function createAnonymousAccessToken({
  type,
  id,
  passwordHash,
}: {
  type: AccessType
  id: number | string
  passwordHash: string
}) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(`${type}:${id}:${passwordHash}`)
    .digest('hex')
}

export function getAnonymousAccessKey({
  type,
  id,
}: {
  type: AccessType
  id: number | string
}) {
  return `${type}:${id}`
}

export function parseAnonymousAccessCookie(value?: string | null): AccessMap {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

export function serializeAnonymousAccessCookie(value: AccessMap) {
  return JSON.stringify(value)
}

export function setAnonymousAccessEntry({
  currentValue,
  type,
  id,
  passwordHash,
}: {
  currentValue?: string | null
  type: AccessType
  id: number | string
  passwordHash: string
}) {
  const map = parseAnonymousAccessCookie(currentValue)

  const key = getAnonymousAccessKey({ type, id })
  const token = createAnonymousAccessToken({
    type,
    id,
    passwordHash,
  })

  map[key] = token

  return serializeAnonymousAccessCookie(map)
}

export function verifyAnonymousAccessEntry({
  cookieValue,
  type,
  id,
  passwordHash,
}: {
  cookieValue?: string | null
  type: AccessType
  id: number | string
  passwordHash?: string | null
}) {
  if (!passwordHash) return false

  const map = parseAnonymousAccessCookie(cookieValue)
  const key = getAnonymousAccessKey({ type, id })
  const token = map[key]

  if (!token) return false

  const expected = createAnonymousAccessToken({
    type,
    id,
    passwordHash,
  })

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(token),
    )
  } catch {
    return false
  }
}