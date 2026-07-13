import type { Payload } from 'payload'

type ForbiddenWordType = 'name' | 'content'

function splitWords(value?: string | null) {
  return String(value || '')
    .split(/[\n,]/)
    .map((word) => word.trim())
    .filter(Boolean)
}

export async function getForbiddenWords(payload: Payload) {
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  }) as any

  return {
    names: splitWords(settings?.forbiddenWords?.registration),
    contents: splitWords(settings?.forbiddenWords?.content),
  }
}

export async function validateForbiddenWords({
  payload,
  text,
  type,
}: {
  payload: Payload
  text: string
  type: ForbiddenWordType
}) {
  const words = await getForbiddenWords(payload)

  const targetWords =
    type === 'name' ? words.names : words.contents

  const normalized = text.toLowerCase()

  const matched = targetWords.find((word) =>
    normalized.includes(word.toLowerCase()),
  )

  if (matched) {
    throw new Error('Your input contains forbidden words.')
  }
}