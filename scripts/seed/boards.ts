import type { Board } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedUsers } from './users'
import { logStep, upsertByUnique } from './utils'

export type SeedBoards = Record<
  | 'free'
  | 'qna'
  | 'notice'
  | 'gallery'
  | 'compact'
  | 'anonymous'
  | 'manager'
  | 'market',
  Board
>

export async function seedBoards(
  { payload }: SeedContext,
  users: SeedUsers,
): Promise<SeedBoards> {
  logStep('Seeding boards')

  const managerIds = [users.manager.id]

  const free = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'free',
    data: {
      name: 'Free Board',
      slug: 'free',
      description: 'General discussion list board.',
      boardType: 'list',
      order: 10,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      listSettings: { postsPerPage: 20, showAuthor: true, showDate: true, showViewCount: true },
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 5 },
    },
  })

  const qna = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'qna',
    data: {
      name: 'Q&A',
      slug: 'qna',
      description: 'Questions, answers, and accepted answer tests.',
      boardType: 'qna',
      order: 20,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 3 },
    },
  })

  const notice = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'notice',
    data: {
      name: 'Notice',
      slug: 'notice',
      description: 'Pinned notices and ticker tests.',
      boardType: 'notice',
      order: 1,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      writeSettings: { allowWrite: 'admin', allowCommentWrite: 'admin', allowComment: false, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: false, maxAttachments: 0 },
    },
  })

  const gallery = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'gallery',
    data: {
      name: 'Gallery',
      slug: 'gallery',
      description: 'Image-heavy posts for gallery/card display.',
      boardType: 'gallery',
      order: 30,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      skinSettings: { gridColumns: '3' },
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 8 },
    },
  })

  const compact = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'compact',
    data: {
      name: 'Compact',
      slug: 'compact',
      description: 'Compact row display test board.',
      boardType: 'compact',
      order: 40,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      skinSettings: { gridColumns: '4' },
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 2 },
    },
  })

  const anonymous = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'anonymous',
    data: {
      name: 'Anonymous Lounge',
      slug: 'anonymous',
      description: 'Anonymous post/comment verification scenarios.',
      boardType: 'list',
      order: 50,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: true, allowAnonymousComment: true, allowAttachment: true, maxAttachments: 3 },
    },
  })

  const manager = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'manager',
    data: {
      name: 'Manager Board',
      slug: 'manager',
      description: 'Manager-only posting and comment permission tests.',
      boardType: 'list',
      order: 60,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      writeSettings: { allowWrite: 'manager', allowCommentWrite: 'manager', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 3 },
    },
  })

  const market = await upsertByUnique<Board>({
    payload,
    collection: 'boards',
    uniqueField: 'slug',
    uniqueValue: 'marketplace',
    data: {
      name: 'Marketplace',
      slug: 'marketplace',
      description: 'Card board for listings and many thumbnails.',
      boardType: 'card',
      order: 70,
      isActive: true,
      managerEnabled: true,
      managers: managerIds,
      skinSettings: { gridColumns: '3' },
      writeSettings: { allowWrite: 'member', allowCommentWrite: 'member', allowComment: true, allowAnonymous: false, allowAnonymousComment: false, allowAttachment: true, maxAttachments: 6 },
    },
  })

  return { free, qna, notice, gallery, compact, anonymous, manager, market }
}
