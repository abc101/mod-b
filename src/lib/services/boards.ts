import type { Payload, Where } from 'payload'

import type { Board } from '@/types/payload'

type GetBoardsOptions = {
  payload: Payload
  activeOnly?: boolean
  limit?: number
  depth?: number
}

type GetBoardBySlugOptions = {
  payload: Payload
  slug: string
  activeOnly?: boolean
  depth?: number
}

type GetBoardByIdOptions = {
  payload: Payload
  id: number
  activeOnly?: boolean
  depth?: number
}

export async function getBoards({
  payload,
  activeOnly = true,
  limit = 100,
  depth = 1,
}: GetBoardsOptions) {
  const conditions: NonNullable<Where['and']> = []

  if (activeOnly) {
    conditions.push({
      isActive: {
        equals: true,
      },
    })
  }

  const where: Where =
    conditions.length > 0
      ? {
          and: conditions,
        }
      : {}

  return payload.find({
    collection: 'boards',
    where,
    sort: 'order',
    limit,
    depth,
    overrideAccess: true,
  })
}

export async function getBoardBySlug({
  payload,
  slug,
  activeOnly = true,
  depth = 2,
}: GetBoardBySlugOptions): Promise<Board | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  const conditions: NonNullable<Where['and']> = [
    {
      slug: {
        equals: normalizedSlug,
      },
    },
  ]

  if (activeOnly) {
    conditions.push({
      isActive: {
        equals: true,
      },
    })
  }

  const result = await payload.find({
    collection: 'boards',
    where: {
      and: conditions,
    },
    limit: 1,
    depth,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

export async function getBoardById({
  payload,
  id,
  activeOnly = true,
  depth = 2,
}: GetBoardByIdOptions): Promise<Board | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  const board = await payload.findByID({
    collection: 'boards',
    id,
    depth,
    overrideAccess: true,
  })

  if (!board) {
    return null
  }

  if (activeOnly && board.isActive === false) {
    return null
  }

  return board
}
