import type { BookmarkFolder, BookmarkItem, Post, User } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedPosts } from './posts'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export type SeedBookmarks = {
  folders: BookmarkFolder[]
  items: BookmarkItem[]
}

export async function seedBookmarks(
  { payload }: SeedContext,
  users: SeedUsers,
  posts: SeedPosts,
): Promise<SeedBookmarks> {
  logStep('Seeding bookmark folders and items')

  const usersToSeed: User[] = [users.admin, users.manager, users.editor, ...users.members.slice(0, 5)]
  const folders: BookmarkFolder[] = []
  const items: BookmarkItem[] = []
  const postPool: Post[] = posts.all.filter((post) => post.status === 'published' && !post.isDeleted)

  for (const user of usersToSeed) {
    const defaultFolder = await upsertByUnique<BookmarkFolder>({
      payload,
      collection: 'bookmark-folders',
      uniqueField: 'name',
      uniqueValue: `Mod-B Default ${user.id}`,
      data: {
        user: user.id,
        name: `Mod-B Default ${user.id}`,
        description: 'Default Mod-B bookmark folder.',
        isDefault: true,
        isPublic: false,
        order: 0,
      },
    })

    const researchFolder = await upsertByUnique<BookmarkFolder>({
      payload,
      collection: 'bookmark-folders',
      uniqueField: 'name',
      uniqueValue: `Mod-B Research ${user.id}`,
      data: {
        user: user.id,
        name: `Mod-B Research ${user.id}`,
        description: 'Custom Mod-B folder for move/select tests.',
        isDefault: false,
        isPublic: false,
        order: 10,
      },
    })

    folders.push(defaultFolder, researchFolder)

    for (let i = 0; i < 6; i++) {
      const post = pick(postPool, Number(user.id) + i)
      const folder = i % 2 === 0 ? defaultFolder : researchFolder
      const note = i % 3 === 0 ? `Mod-B note for ${post.title}` : undefined
      const uniqueValue = `${folder.id}:${post.id}`

      const item = await upsertByUnique<BookmarkItem>({
        payload,
        collection: 'bookmark-items',
        uniqueField: 'note',
        uniqueValue: note || `Mod-B bookmark ${uniqueValue}`,
        data: {
          folder: folder.id,
          post: post.id,
          note: note || `Mod-B bookmark ${uniqueValue}`,
        },
      })

      items.push(item)
    }
  }

  return { folders, items }
}
