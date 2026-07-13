import type { Payload } from 'payload'
import type {
  BookmarkFolder,
  BookmarkItem,
} from '@/types/payload'

type RelationshipId = number | string

function toNumericId(
  value: RelationshipId,
  fieldName: string,
): number {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(value)

  if (
    !Number.isInteger(numericValue) ||
    numericValue <= 0
  ) {
    throw new Error(`Invalid ${fieldName}.`)
  }

  return numericValue
}

export async function getDefaultBookmarkFolder({
  payload,
  userId,
}: {
  payload: Payload
  userId: RelationshipId
}): Promise<BookmarkFolder> {
  const numericUserId = toNumericId(
    userId,
    'user ID',
  )

  const existing = await payload.find({
    collection: 'bookmark-folders',
    where: {
      and: [
        {
          user: {
            equals: numericUserId,
          },
        },
        {
          isDefault: {
            equals: true,
          },
        },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const existingFolder = existing.docs[0]

  if (existingFolder) {
    return existingFolder
  }

  return payload.create({
    collection: 'bookmark-folders',
    data: {
      user: numericUserId,
      name: 'Default',
      isDefault: true,
      isPublic: false,
      order: 0,
    },
    overrideAccess: true,
  })
}

export async function getBookmarkItem({
  payload,
  userId,
  postId,
}: {
  payload: Payload
  userId: RelationshipId
  postId: RelationshipId
}): Promise<BookmarkItem | null> {
  const numericUserId = toNumericId(
    userId,
    'user ID',
  )

  const numericPostId = toNumericId(
    postId,
    'post ID',
  )

  const folders = await payload.find({
    collection: 'bookmark-folders',
    where: {
      user: {
        equals: numericUserId,
      },
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const folderIds = folders.docs.map(
    (folder) => folder.id,
  )

  if (folderIds.length === 0) {
    return null
  }

  const result = await payload.find({
    collection: 'bookmark-items',
    where: {
      and: [
        {
          folder: {
            in: folderIds,
          },
        },
        {
          post: {
            equals: numericPostId,
          },
        },
      ],
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

export async function toggleDefaultBookmark({
  payload,
  userId,
  postId,
}: {
  payload: Payload
  userId: RelationshipId
  postId: RelationshipId
}): Promise<boolean> {
  const numericUserId = toNumericId(
    userId,
    'user ID',
  )

  const numericPostId = toNumericId(
    postId,
    'post ID',
  )

  const existing = await getBookmarkItem({
    payload,
    userId: numericUserId,
    postId: numericPostId,
  })

  if (existing) {
    await payload.delete({
      collection: 'bookmark-items',
      id: existing.id,
      overrideAccess: true,
    })

    return false
  }

  const folder = await getDefaultBookmarkFolder({
    payload,
    userId: numericUserId,
  })

  await payload.create({
    collection: 'bookmark-items',
    data: {
      folder: folder.id,
      post: numericPostId,
    },
    overrideAccess: true,
  })

  return true
}

export async function isPostBookmarked({
  payload,
  userId,
  postId,
}: {
  payload: Payload
  userId?: RelationshipId | null
  postId: RelationshipId
}): Promise<boolean> {
  if (userId === undefined || userId === null) {
    return false
  }

  const item = await getBookmarkItem({
    payload,
    userId,
    postId,
  })

  return item !== null
}