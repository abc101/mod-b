import type { Comment, Post, User } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedPosts } from './posts'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export type SeedComments = {
  all: Comment[]
  replies: Comment[]
}

export async function seedComments(
  { payload }: SeedContext,
  users: SeedUsers,
  posts: SeedPosts,
): Promise<SeedComments> {
  logStep('Seeding comments and replies')

  const authors: User[] = [users.admin, users.manager, users.editor, ...users.members]
  const all: Comment[] = []
  const replies: Comment[] = []

  const targetPosts = posts.all.filter((post) => post.status === 'published' && !post.isDeleted)

  for (let i = 0; i < targetPosts.length; i++) {
    const post = targetPosts[i]
    const commentCount = 1 + (i % 5)

    for (let j = 1; j <= commentCount; j++) {
      const isAnonymous = i % 9 === 0 && j === 1
      const isDeleted = i % 13 === 0 && j === 2
      const author = pick(authors, i + j)
      const content = `Mod-B comment ${j} on ${post.title}. @mod-b-member-${(j % 5) + 1} This comment tests display, mentions, sorting, nested replies, and deleted states.`

      const comment = await upsertByUnique<Comment>({
        payload,
        collection: 'comments',
        uniqueField: 'content',
        uniqueValue: content,
        data: {
          post: post.id,
          author: isAnonymous ? undefined : author.id,
          anonymousAuthor: isAnonymous ? `Anonymous Commenter ${j}` : undefined,
          anonymousIp: isAnonymous ? `127.0.1.${j}` : undefined,
          anonymousPasswordHash: isAnonymous ? `mod-b-comment-password-hash-${j}` : undefined,
          anonymousUserAgent: isAnonymous ? 'Mod-B Seed Anonymous Comment Browser' : undefined,
          content,
          likeCount: (i + j) % 7,
          isDeleted,
        },
      })

      all.push(comment)

      if (j === 1 && i % 2 === 0) {
        const replyContent = `Mod-B reply to comment on ${post.title}. This validates nested reply rendering.`
        const reply = await upsertByUnique<Comment>({
          payload,
          collection: 'comments',
          uniqueField: 'content',
          uniqueValue: replyContent,
          data: {
            post: post.id,
            author: pick(authors, i + 3).id,
            parentComment: comment.id,
            content: replyContent,
            likeCount: i % 4,
            isDeleted: false,
          },
        })

        replies.push(reply)
        all.push(reply)
      }
    }
  }

  // Wire accepted answers for a subset of Q&A posts.
  for (let i = 0; i < posts.qnaQuestions.length; i++) {
    const question = posts.qnaQuestions[i]
    const accepted = all.find((comment) => String((comment as any).post) === String(question.id))
    if (!accepted || i % 2 !== 0) continue

    await payload.update({
      collection: 'posts',
      id: question.id,
      data: {
        isAnswered: true,
        acceptedCommentId: Number(accepted.id),
      },
      overrideAccess: true,
    })
  }

  return { all, replies }
}
