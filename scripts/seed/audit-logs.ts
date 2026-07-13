import type { AuditLog } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedPosts } from './posts'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export async function seedAuditLogs(
  { payload }: SeedContext,
  users: SeedUsers,
  posts: SeedPosts,
): Promise<AuditLog[]> {
  logStep('Seeding audit logs')

  const logs: AuditLog[] = []
  const actions = ['create', 'update', 'delete', 'restore', 'verify', 'report', 'moderate'] as const
  const actors = [users.admin, users.manager, users.editor]

  for (let i = 0; i < 24; i++) {
    const post = pick(posts.all, i)
    const action = pick([...actions], i)
    const message = `Mod-B audit ${action} on post ${post.id}`

    logs.push(await upsertByUnique<AuditLog>({
      payload,
      collection: 'audit-logs',
      uniqueField: 'message',
      uniqueValue: message,
      data: {
        action,
        resourceType: 'post',
        resourceId: String(post.id),
        actorType: i % 6 === 0 ? 'anonymous' : 'user',
        actor: i % 6 === 0 ? undefined : pick(actors, i).id,
        anonymousAuthor: i % 6 === 0 ? 'Anonymous Mod-B actor' : undefined,
        ip: `127.0.3.${i + 1}`,
        userAgent: 'Mod-B Seed Browser',
        message,
        metadata: {
          seed: true,
          board: (post as any).board,
        },
      },
    }))
  }

  return logs
}
