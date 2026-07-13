'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'

async function getCurrentUser() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    throw new Error('Login required.')
  }

  return { payload, headers, user }
}

export async function createBookmarkFolder(formData: FormData) {
  const { payload, user } = await getCurrentUser()

  const name = String(formData.get('name') || '').trim()

  if (!name) {
    throw new Error('Folder name is required.')
  }

  await payload.create({
    collection: 'bookmark-folders',
    data: {
      user: user.id,
      name,
      isDefault: false,
      isPublic: false,
      order: 0,
    },
    overrideAccess: true,
  })

  revalidatePath('/my-page/bookmarks')
}

export async function deleteBookmarkFolder(folderId: number) {
  const { payload, user } = await getCurrentUser()

  const folder = await payload.findByID({
    collection: 'bookmark-folders',
    id: folderId,
    depth: 0,
    overrideAccess: true,
  }) as any

  if (!folder) {
    throw new Error('Folder not found.')
  }

  if (String(folder.user) !== String(user.id)) {
    throw new Error('No permission.')
  }

  if (folder.isDefault) {
    throw new Error('Default folder cannot be deleted.')
  }

  await payload.delete({
    collection: 'bookmark-folders',
    id: folderId,
    overrideAccess: true,
  })

  revalidatePath('/my-page/bookmarks')
}

export async function moveBookmarkItem(
  itemId: number,
  targetFolderId: number,
) {
  const { payload, user } = await getCurrentUser()

  const item = await payload.findByID({
    collection: 'bookmark-items',
    id: itemId,
    depth: 2,
    overrideAccess: true,
  }) as any

  if (!item) throw new Error('Bookmark not found.')

  const currentFolderUser =
    item.folder?.user?.id || item.folder?.user

  if (String(currentFolderUser) !== String(user.id)) {
    throw new Error('No permission.')
  }

  const targetFolder = await payload.findByID({
    collection: 'bookmark-folders',
    id: targetFolderId,
    depth: 0,
    overrideAccess: true,
  }) as any

  if (!targetFolder) throw new Error('Target folder not found.')

  const targetFolderUser =
    targetFolder.user?.id || targetFolder.user

  if (String(targetFolderUser) !== String(user.id)) {
    throw new Error('No permission.')
  }

  await payload.update({
    collection: 'bookmark-items',
    id: itemId,
    data: {
      folder: targetFolderId,
    },
    overrideAccess: true,
  })

  revalidatePath('/my-page/bookmarks')
}