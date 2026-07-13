import type { Board, Post } from '@/payload-types'

import type { SeedBoards } from './boards'
import type { SeedPosts } from './posts'
import type { SeedContext } from './utils'
import { logStep } from './utils'

const PINNED_POSTS_PER_BOARD = 2

type BoardEntry = {
  key: keyof SeedBoards
  board: Board
}

export async function seedPinnedPosts(
  { payload }: SeedContext,
  boards: SeedBoards,
  posts: SeedPosts,
) {
  logStep('Enabling pinned notices and pinning posts on every board')

  const entries: BoardEntry[] = [
    { key: 'notice', board: boards.notice },
    { key: 'free', board: boards.free },
    { key: 'qna', board: boards.qna },
    { key: 'gallery', board: boards.gallery },
    { key: 'compact', board: boards.compact },
    { key: 'anonymous', board: boards.anonymous },
    { key: 'manager', board: boards.manager },
    { key: 'market', board: boards.market },
  ]

  for (const { key, board } of entries) {
    await payload.update({
      collection: 'boards',
      id: board.id,
      data: {
        announcementSettings: {
          enablePinnedNotices: true,
          maxPinnedNotices: 5,
        },
      } as never,
      overrideAccess: true,
    })

    const candidates = (posts.byBoard[String(key)] || [])
      .filter((post: Post) => !post.isDeleted)
      .slice(0, PINNED_POSTS_PER_BOARD)

    if (candidates.length < PINNED_POSTS_PER_BOARD) {
      throw new Error(
        `Board ${String(key)} does not have enough seed posts to pin.`,
      )
    }

    for (const post of candidates) {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          isNotice: true,
          status: 'published',
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        } as never,
        overrideAccess: true,
      })
    }

    console.log(`   ${String(key)}: pinned ${candidates.length} posts`)
  }
}
