import type { Report } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedComments } from './comments'
import type { SeedPosts } from './posts'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export async function seedReports(
  { payload }: SeedContext,
  users: SeedUsers,
  posts: SeedPosts,
  comments: SeedComments,
): Promise<Report[]> {
  logStep('Seeding reports')

  const reports: Report[] = []
  const reasons = ['spam', 'abuse', 'inappropriate', 'personal_info', 'other'] as const
  const statuses = ['open', 'reviewing', 'resolved', 'dismissed'] as const
  const reporters = [users.admin, users.manager, users.editor, ...users.members]

  for (let i = 0; i < 16; i++) {
    const targetType = i % 3 === 0 ? 'comment' : 'post'
    const target = targetType === 'comment' ? pick(comments.all, i) : pick(posts.all, i)
    const reason = pick([...reasons], i)
    const status = pick([...statuses], i)
    const title = `Mod-B report ${targetType}-${target.id}-${reason}`

    reports.push(await upsertByUnique<Report>({
      payload,
      collection: 'reports',
      uniqueField: 'details',
      uniqueValue: title,
      data: {
        targetType,
        targetId: String(target.id),
        reason,
        details: title,
        status,
        reporter: pick(reporters, i).id,
        reporterIp: `127.0.2.${i + 1}`,
        userAgent: 'Mod-B Seed Browser',
        metadata: {
          seed: true,
          targetTitle: (target as any).title || (target as any).content?.slice(0, 40),
        },
      },
    }))
  }

  return reports
}
