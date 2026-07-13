import type { Payload } from 'payload'

export async function resolveMentionUsers({
  payload,
  handles,
}: {
  payload: Payload
  handles: string[]
}) {
  if (handles.length === 0) return []

  const users = await payload.find({
    collection: 'users',
    where: {
      nickname: {
        in: handles,
      },
    },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  return users.docs
}