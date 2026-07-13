import type {
  Post,
  Comment,
  Notification,
  Report,
} from '@/payload-types'
import type { PaginatedDocs } from 'payload'
import type { DashboardAnalytics } from '@/types/dashboard'
import { countBy } from './helpers'

function getRelationField<T extends object, K extends keyof T>(
  value: number | T | null | undefined,
  key: K,
): T[K] | undefined {
  if (!value || typeof value !== 'object') return undefined
  return value[key]
}

export function buildDashboardAnalytics({
  analyticsPosts,
  analyticsComments,
  analyticsNotifications,
  analyticsReports,
}: {
  analyticsPosts: PaginatedDocs<Post>
  analyticsComments: PaginatedDocs<Comment>
  analyticsNotifications: PaginatedDocs<Notification>
  analyticsReports: PaginatedDocs<Report>
}): DashboardAnalytics {
  const topBoards = countBy(
    analyticsPosts.docs,
    (post: any) => post.board?.name || post.board?.slug,
  ).slice(0, 5)

  const activeUsers = countBy(
    [...analyticsPosts.docs, ...analyticsComments.docs],
    (item: any) =>
      item.author?.nickname ||
      item.author?.name ||
      item.author?.email,
  ).slice(0, 5)

  const trendingTags = countBy(
    analyticsPosts.docs.flatMap((post: any) => post.tags || []),
    (tag: any) => tag.tag,
  ).slice(0, 8)

  const notificationStats = countBy(
    analyticsNotifications.docs,
    (item: any) => item.type,
  ).slice(0, 6)

  const reportStats = countBy(
    analyticsReports.docs,
    (item: any) => item.reason,
  ).slice(0, 6)

  return {
    topBoards,
    activeUsers,
    trendingTags,
    notificationStats,
    reportStats,
  }
}