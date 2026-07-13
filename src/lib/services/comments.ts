import type { Payload, Where  } from 'payload'
import type { Board } from '@/types/payload'

export async function searchComments({
  payload,
  keyword,
  limit = 10,
  depth = 2,
}: {
  payload: Payload
  keyword: string
  limit?: number
  depth?: number
}) {
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { content: { like: keyword } },
        { isDeleted: { equals: false } },
      ],
    },
    sort: '-createdAt',
    limit,
    depth,
  })
}

export async function getCommentsByAuthor({
  payload,
  authorId,
  page = 1,
  limit = 20,
  includeDeleted = false,
  depth = 2,
}: {
  payload: Payload
  authorId: number | string
  page?: number
  limit?: number
  includeDeleted?: boolean
  depth?: number
}) {
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { author: { equals: authorId } },
        { isDeleted: { equals: false } },
      ],
    },
    sort: '-createdAt',
    page,
    limit,
    depth,
  })
}

export async function getCommentsByPost({
  payload,
  postId,
  limit = 100,
  depth = 2,
}: {
  payload: Payload
  postId: number
  limit?: number
  depth?: number
}) {
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { post: { equals: postId } },
        { parentComment: { exists: false } },
      ],
    },
    sort: 'createdAt',
    limit,
    depth,
  })
}

export async function getRepliesByPost({
  payload,
  postId,
  limit = 500,
  depth = 2,
}: {
  payload: Payload
  postId: number
  limit?: number
  depth?: number
}) {
  return payload.find({
    collection: 'comments',
    where: {
      and: [
        { post: { equals: postId } },
        { parentComment: { exists: true } },
      ],
    },
    sort: 'createdAt',
    limit,
    depth,
  })
}

export async function getRecentComments({
  payload,
  filterBoards = [],
  limit = 10,
  depth = 2,
}: {
  payload: Payload
  filterBoards?: Array<number | { id: number }>
  limit?: number
  depth?: number
}) {
  const boardIds = filterBoards.map((board) =>
    typeof board === 'object'
      ? board.id
      : board,
  )

  const conditions: NonNullable<Where['and']> = [
    {
      isDeleted: {
        not_equals: true,
      },
    },
  ]

  if (boardIds.length > 0) {
    conditions.push({
      'post.board': {
        in: boardIds,
      },
    })
  }

  const where: Where = {
    and: conditions,
  }

  return payload.find({
    collection: 'comments',
    where,
    sort: '-createdAt',
    limit,
    depth,
    overrideAccess: true,
  })
}