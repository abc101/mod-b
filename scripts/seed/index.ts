import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'

import type { Config } from '@/payload-types'

import { seedAdvertisements } from './advertisements'
import { seedAnnouncements } from './announcements'
import { seedAuditLogs } from './audit-logs'
import { seedBoards } from './boards'
import { seedBookmarks } from './bookmarks'
import { seedComments } from './comments'
import { seedFinalGlobals, seedPreUserGlobals } from './globals'
import { seedLoginLogs } from './login-logs'
import { seedMedia } from './media'
import { seedNotifications } from './notifications'
import { seedPages } from './pages'
import { seedPosts } from './posts'
import { seedReports } from './reports'
import { seedUsers } from './users'
import { logStep, type SeedContext } from './utils'

import { seedDateTimeSettings } from './date-time'
import { seedGlobalHeroSlider } from './hero-slider'
import { seedPinnedPosts } from './pinned-posts'

if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_SEED !== 'I_UNDERSTAND_THE_RISK'
) {
  throw new Error('QA seed cannot run in production.')
}

const SEED_USER_EMAILS = [
  'admin@mod-b.local',
  'manager@mod-b.local',
  'editor@mod-b.local',
  ...Array.from(
    { length: 12 },
    (_, index) => `member${index + 1}@mod-b.local`,
  ),
  'inactive@mod-b.local',
]

const SEED_BOARD_SLUGS = [
  'notice',
  'free',
  'qna',
  'gallery',
  'compact',
  'anonymous',
  'manager',
  'marketplace',
]

const SEED_PAGE_SLUGS = ['terms', 'privacy']

type CollectionSlug = keyof Config['collections']
type DocumentId = number | string

async function findIds(
  payload: Payload,
  collection: CollectionSlug,
  where: Record<string, unknown>,
): Promise<DocumentId[]> {
  const result = await payload.find({
    collection,
    where: where as never,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  return result.docs.map(
    (doc) => (doc as { id: DocumentId }).id,
  )
}

async function deleteIds(
  payload: Payload,
  collection: CollectionSlug,
  ids: DocumentId[],
) {
  for (const id of ids) {
    await payload.delete({
      collection,
      id,
      overrideAccess: true,
    }).catch((error) => {
      console.warn(
        `Could not delete ${collection} ${String(id)}:`,
        error?.message,
      )
    })
  }
}

async function resetModBData(ctx: SeedContext) {
  if (!ctx.reset) return

  const { payload } = ctx
  logStep('Resetting Mod-B demo data only')

  const userIds = await findIds(payload, 'users', {
    email: {
      in: SEED_USER_EMAILS,
    },
  })

  const postIds = await findIds(payload, 'posts', {
    'tags.tag': {
      equals: 'mod-b-seed',
    },
  })

  const commentIds =
    postIds.length > 0
      ? await findIds(payload, 'comments', {
          post: {
            in: postIds,
          },
        })
      : []

  const folderIds =
    userIds.length > 0
      ? await findIds(payload, 'bookmark-folders', {
          user: {
            in: userIds,
          },
        })
      : []

  const bookmarkItemIds =
    folderIds.length > 0
      ? await findIds(payload, 'bookmark-items', {
          folder: {
            in: folderIds,
          },
        })
      : []

  const notificationIds = await findIds(payload, 'notifications', {
    or: [
      {
        'metadata.source': {
          equals: 'mod-b-seed',
        },
      },
      {
        title: {
          contains: 'Mod-B',
        },
      },
    ],
  })

  const reportIds = await findIds(payload, 'reports', {
    details: {
      contains: 'Mod-B report',
    },
  })

  const auditLogIds = await findIds(payload, 'audit-logs', {
    message: {
      contains: 'Mod-B audit',
    },
  })

  const loginLogIds =
    userIds.length > 0
      ? await findIds(payload, 'login-logs', {
          user: {
            in: userIds,
          },
        })
      : []

  const advertisementIds = await findIds(payload, 'advertisements', {
    title: {
      contains: 'Mod-B',
    },
  })

  const announcementIds = await findIds(payload, 'announcements', {
    title: {
      contains: 'Mod-B',
    },
  })

  const extraPageIds = await findIds(payload, 'pages', {
    slug: {
      in: SEED_PAGE_SLUGS,
    },
    title: {
      contains: 'Mod-B',
    },
  })

  const boardIds = await findIds(payload, 'boards', {
    slug: {
      in: SEED_BOARD_SLUGS,
    },
  })

  const mediaIds = await findIds(payload, 'media', {
    or: [
      {
        alt: {
          contains: 'Mod-B',
        },
      },
      {
        filename: {
          contains: 'mod-b-demo-',
        },
      },
    ],
  })

  await deleteIds(payload, 'bookmark-items', bookmarkItemIds)
  await deleteIds(payload, 'bookmark-folders', folderIds)
  await deleteIds(payload, 'notifications', notificationIds)
  await deleteIds(payload, 'reports', reportIds)
  await deleteIds(payload, 'audit-logs', auditLogIds)
  await deleteIds(payload, 'login-logs', loginLogIds)
  await deleteIds(payload, 'comments', commentIds)
  await deleteIds(payload, 'posts', postIds)
  await deleteIds(payload, 'announcements', announcementIds)
  await deleteIds(payload, 'advertisements', advertisementIds)
  await deleteIds(payload, 'pages', extraPageIds)
  await deleteIds(payload, 'boards', boardIds)
  await deleteIds(payload, 'media', mediaIds)
  await deleteIds(payload, 'users', userIds)

  // Intentionally preserve the existing home page and application globals.
  console.log('   Existing Home page and globals were preserved.')
}

async function run() {
  const payload = await getPayload({ config: configPromise })
  const ctx: SeedContext = {
    payload,
    reset: process.argv.includes('--reset'),
    now: new Date(),
  }

  console.log('\nStarting Mod-B demo seed')
  console.log(`   reset: ${ctx.reset ? 'yes' : 'no'}`)

  await resetModBData(ctx)
  await seedPreUserGlobals(ctx)

  const users = await seedUsers(ctx)
  const boards = await seedBoards(ctx, users)
  const media = await seedMedia(ctx)
  const posts = await seedPosts(ctx, users, boards, media)
  await seedPinnedPosts(ctx, boards, posts)

  const comments = await seedComments(ctx, users, posts)
  const bookmarks = await seedBookmarks(ctx, users, posts)
  const notifications = await seedNotifications(
    ctx,
    users,
    posts,
    comments,
  )
  const reports = await seedReports(ctx, users, posts, comments)
  const ads = await seedAdvertisements(ctx, boards, media)
  const announcements = await seedAnnouncements(ctx, boards)
  const pages = await seedPages(ctx, boards, media, ads)
  const auditLogs = await seedAuditLogs(ctx, users, posts)
  const loginLogs = await seedLoginLogs(ctx, users)
  await seedFinalGlobals(ctx, boards, media, ads)
  await seedGlobalHeroSlider(ctx, boards, media)
  await seedDateTimeSettings(ctx)

  console.log('\nMod-B demo seed complete')
  console.table({
    users: 16,
    boards: Object.keys(boards).length,
    media:
      media.hero.length +
      media.thumbs.length +
      media.ads.length,
    posts: posts.all.length,
    comments: comments.all.length,
    bookmarkFolders: bookmarks.folders.length,
    bookmarkItems: bookmarks.items.length,
    notifications: notifications.length,
    reports: reports.length,
    advertisements: ads.length,
    announcements: announcements.length,
    pages: pages.length,
    auditLogs: auditLogs.length,
    loginLogs: loginLogs.length,
  })

  console.log('\nDemo login accounts')
  console.log('   admin@mod-b.local / ModB-Demo-2026!')
  console.log('   manager@mod-b.local / ModB-Demo-2026!')
  console.log('   editor@mod-b.local / ModB-Demo-2026!')
  console.log('   member1@mod-b.local / ModB-Demo-2026!')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nMod-B demo seed failed')
    console.error(error)
    process.exit(1)
  })
