import type { Payload } from 'payload'

export async function getSitemapPages({ payload }: { payload: Payload }) {
  return payload.find({
    collection: 'pages',
    where: {
      status: { equals: 'published' },
    },
    limit: 1000,
    depth: 0,
  })
}

export async function getSitemapBoards({ payload }: { payload: Payload }) {
  return payload.find({
    collection: 'boards',
    where: {
      isActive: { equals: true },
    },
    limit: 1000,
    depth: 0,
  })
}

export async function getSitemapPosts({ payload }: { payload: Payload }) {
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { isSecret: { not_equals: true } },
        { isDeleted: { not_equals: true } },
      ],
    },
    sort: '-updatedAt',
    limit: 10000,
    depth: 1,
  })
}