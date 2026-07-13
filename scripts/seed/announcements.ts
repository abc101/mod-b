import type { Announcement } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedBoards } from './boards'
import { daysFrom, logStep, upsertByUnique } from './utils'

export async function seedAnnouncements(
  ctx: SeedContext,
  boards: SeedBoards,
): Promise<Announcement[]> {
  const { payload, now } = ctx
  logStep('Seeding announcements')

  const specs = [
    { title: 'Mod-B Maintenance Notice', message: 'Scheduled maintenance seed announcement.', linkType: 'custom', customUrl: '/board/notice', displayType: 'ticker', order: 1 },
    { title: 'Mod-B Free Board Event', message: 'Check the seeded free board for latest Mod-B posts.', linkType: 'board', boardLink: boards.free.id, displayType: 'ticker', order: 2 },
    { title: 'Mod-B Future Announcement', message: 'This announcement should not appear yet.', linkType: 'custom', customUrl: '/', displayType: 'ticker', startDate: daysFrom(now, 5), endDate: daysFrom(now, 10), order: 99 },
  ]

  const docs: Announcement[] = []
  for (const spec of specs) {
    docs.push(await upsertByUnique<Announcement>({
      payload,
      collection: 'announcements',
      uniqueField: 'title',
      uniqueValue: spec.title,
      data: {
        startDate: spec.startDate ?? daysFrom(now, -2),
        endDate: spec.endDate ?? daysFrom(now, 20),
        isActive: true,
        ...spec,
      },
    }))
  }

  return docs
}
