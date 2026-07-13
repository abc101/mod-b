import type { Payload } from 'payload'

export async function getPage({
  payload,
  slug,
  status = 'published',
  depth = 3,
}: {
  payload: Payload
  slug: string
  status?: 'published' | 'draft'
  depth?: number
}) {
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          status: {
            equals: status,
          },
        },
      ],
    },
    limit: 1,
    depth,
  })

  return result.docs[0] ?? null
}