import type { Board, Post, User } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedBoards } from './boards'
import type { SeedMedia } from './media'
import type { SeedUsers } from './users'
import { htmlContent, logStep, paragraph, pick, upsertByUnique } from './utils'

export type SeedPosts = {
  all: Post[]
  byBoard: Record<string, Post[]>
  qnaQuestions: Post[]
  deleted: Post[]
  secret: Post[]
}

type BoardEntry = {
  key: keyof SeedBoards
  board: Board
  count: number
}

export async function seedPosts(
  { payload }: SeedContext,
  users: SeedUsers,
  boards: SeedBoards,
  media: SeedMedia,
): Promise<SeedPosts> {
  logStep('Seeding posts')

  const authors: User[] = [users.admin, users.manager, users.editor, ...users.members]
  const entries: BoardEntry[] = [
    { key: 'notice', board: boards.notice, count: 8 },
    { key: 'free', board: boards.free, count: 24 },
    { key: 'qna', board: boards.qna, count: 14 },
    { key: 'gallery', board: boards.gallery, count: 18 },
    { key: 'compact', board: boards.compact, count: 12 },
    { key: 'anonymous', board: boards.anonymous, count: 12 },
    { key: 'manager', board: boards.manager, count: 10 },
    { key: 'market', board: boards.market, count: 18 },
  ]

  const all: Post[] = []
  const byBoard: Record<string, Post[]> = {}
  const qnaQuestions: Post[] = []
  const deleted: Post[] = []
  const secret: Post[] = []

  for (const entry of entries) {
    byBoard[entry.key] = []

    for (let i = 1; i <= entry.count; i++) {
      const author = pick(authors, i)
      const thumb = pick(media.thumbs, i)
      const isNotice = entry.key === 'notice' || (entry.key === 'free' && i <= 2)
      const isSecret = i % 11 === 0
      const isDeleted = i % 17 === 0
      const isDraft = i % 19 === 0
      const isAnonymous = entry.key === 'anonymous' && i % 3 === 0
      const isHtml = i % 5 === 0
      const title = `${entry.board.name} Mod-B Post ${String(i).padStart(2, '0')}`

      const post = await upsertByUnique<Post>({
        payload,
        collection: 'posts',
        uniqueField: 'title',
        uniqueValue: title,
        data: {
          title,
          board: entry.board.id,
          author: isAnonymous ? undefined : author.id,
          anonymousAuthor: isAnonymous ? `Anonymous Mod-B ${i}` : undefined,
          anonymousIp: isAnonymous ? `127.0.0.${i}` : undefined,
          anonymousUserAgent: isAnonymous ? 'Mod-B Seed Anonymous Browser' : undefined,
          anonymousPasswordHash: isAnonymous ? `mod-b-seed-password-hash-${i}` : undefined,
          useHtmlContent: true,
          contentHtml: isHtml ? htmlContent(title, i) : paragraph(title, i).replaceAll('\n', '<br />'),
          thumbnail: ['gallery', 'market'].includes(entry.key) || i % 4 === 0 ? thumb.id : undefined,
          attachments: i % 7 === 0 ? [{ file: pick(media.thumbs, i + 2).id }] : [],
          tags: [
            { tag: 'mod-b-seed' },
            { tag: entry.key },
            { tag: i % 2 === 0 ? 'even' : 'odd' },
            ...(i % 3 === 0 ? [{ tag: 'featured' }] : []),
          ],
          viewCount:
            i * 13 +
            (entry.key === 'free'
              ? 120
              : entry.key === 'gallery'
                ? 80
                : entry.key === 'market'
                  ? 60
                  : 0),
          likeCount: i % 9,
          isNotice,
          isSecret,
          isAnswered: entry.key === 'qna' && i % 2 === 0,
          status: isDeleted ? 'deleted' : isDraft ? 'draft' : 'published',
          isDeleted,
          deletedAt: isDeleted ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
          deletedBy: isDeleted ? users.admin.id : undefined,
        },
        depth: 1,
      })

      all.push(post)
      byBoard[entry.key].push(post)
      if (entry.key === 'qna') qnaQuestions.push(post)
      if (isDeleted) deleted.push(post)
      if (isSecret) secret.push(post)
    }
  }

  return { all, byBoard, qnaQuestions, deleted, secret }
}
