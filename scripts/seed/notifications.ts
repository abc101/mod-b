import type { Notification, Post, User } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedComments } from './comments'
import type { SeedPosts } from './posts'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export async function seedNotifications(
  { payload }: SeedContext,
  users: SeedUsers,
  posts: SeedPosts,
  comments: SeedComments,
): Promise<Notification[]> {
  logStep('Seeding notifications')

  const recipients: User[] = [users.admin, users.manager, users.editor, ...users.members.slice(0, 8)]
  const types = ['comment', 'reply', 'qna_answer', 'qna_accepted', 'moderation', 'mention'] as const
  const notifications: Notification[] = []
  const postPool: Post[] = posts.all.filter((post) => post.status === 'published' && !post.isDeleted)

  for (let i = 0; i < 36; i++) {
    const recipient = pick(recipients, i)
    const type = pick([...types], i)
    const post = pick(postPool, i)
    const comment = pick(comments.all, i)
    const title = `Mod-B ${type.replace('_', ' ')} notification ${i + 1}`

    notifications.push(
      await upsertByUnique<Notification>({
        payload,
        collection: 'notifications',
        uniqueField: 'title',
        uniqueValue: title,
        data: {
          recipient: recipient.id,
          type,
          title,
          message: `Notification for ${post.title}. Use this to test read/unread state and my-page notification list.`,
          href: `/board/free/${post.id}`,
          isRead: i % 4 === 0,
          metadata: {
            postId: post.id,
            commentId: comment?.id,
            source: 'mod-b-seed',
          },
        },
      }),
    )
  }

  return notifications
}
