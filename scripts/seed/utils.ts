import type { Payload } from 'payload'

export type SeedContext = {
  payload: Payload
  reset?: boolean
  now: Date
}

export type ID = number | string

export async function findOne<T = any>({
  payload,
  collection,
  where,
  depth = 0,
}: {
  payload: Payload
  collection: string
  where: Record<string, any>
  depth?: number
}): Promise<T | null> {
  const result = await payload.find({
    collection: collection as any,
    where,
    limit: 1,
    depth,
    overrideAccess: true,
  })

  return (result.docs[0] as T | undefined) ?? null
}

export async function upsertByUnique<T = any>({
  payload,
  collection,
  uniqueField,
  uniqueValue,
  data,
  depth = 0,
}: {
  payload: Payload
  collection: string
  uniqueField: string
  uniqueValue: string | number
  data: Record<string, any>
  depth?: number
}): Promise<T> {
  const existing = await findOne<T>({
    payload,
    collection,
    where: { [uniqueField]: { equals: uniqueValue } },
    depth,
  })

  if (existing && typeof existing === 'object' && 'id' in existing) {
    return (await payload.update({
      collection: collection as any,
      id: (existing as any).id,
      data,
      depth,
      overrideAccess: true,
    })) as T
  }

  return (await payload.create({
    collection: collection as any,
    data,
    depth,
    overrideAccess: true,
  })) as T
}

export async function deleteAll(payload: Payload, collection: string) {
  const docs = await payload.find({
    collection: collection as any,
    limit: 1000,
    overrideAccess: true,
  })

  for (const doc of docs.docs) {
    await payload.delete({
      collection: collection as any,
      id: (doc as any).id,
      overrideAccess: true,
    }).catch(() => undefined)
  }
}

export function daysFrom(now: Date, days: number) {
  const next = new Date(now)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

export function minutesAgo(now: Date, minutes: number) {
  const next = new Date(now)
  next.setMinutes(next.getMinutes() - minutes)
  return next.toISOString()
}

export function pick<T>(items: T[], index: number) {
  return items[index % items.length]
}

export function paragraph(title: string, index: number) {
  return [
    `${title} — QA seed article ${index}. This post is intentionally written with enough text to test excerpts, line clamping, search, board lists, and display cards.`,
    `It includes realistic community discussion content, several tags, and varying popularity values so latest, popular, and trending blocks can be visually verified.`,
    `Please use this seed data only in a local development or staging environment.`,
  ].join('\n\n')
}

export function htmlContent(title: string, index: number) {
  return `
    <h2>${title}</h2>
    <p>This is QA HTML content block #${index}. It tests admin HTML rendering, excerpts, and rich previews.</p>
    <ul>
      <li>Latest board section</li>
      <li>Popular/trending sorting</li>
      <li>Post detail display</li>
    </ul>
  `.trim()
}

export function logStep(message: string) {
  console.log(`\n🌱 ${message}`)
}
