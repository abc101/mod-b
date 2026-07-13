import type { Payload } from 'payload'

export async function getUserById({
  payload,
  id,
  depth = 1,
}: {
  payload: Payload
  id: number | string
  depth?: number
}) {
  try {
    return await payload.findByID({
      collection: 'users',
      id,
      depth,
    })
  } catch {
    return null
  }
}