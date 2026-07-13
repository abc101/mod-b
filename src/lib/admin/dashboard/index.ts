import type { Payload } from 'payload'
import type { DashboardData } from '@/types/dashboard'

import { getDashboardQueries } from './queries'
import { buildDashboardAnalytics } from './analytics'

export async function getDashboardData(payload: Payload): Promise<DashboardData> {
  const [
    todayPosts,
    todayComments,
    openReports,
    reviewingReports,
    newUsers,
    totalBookmarks,
    draftPosts,
    deletedPosts,
    notificationsToday,
    anonymousPostsToday,
    recentReports,
    recentAuditLogs,
    latestPosts,
    recentComments,
    analyticsPosts,
    analyticsComments,
    analyticsNotifications,
    analyticsReports,
  ] = await getDashboardQueries(payload)

  const analytics = buildDashboardAnalytics({
    analyticsPosts,
    analyticsComments,
    analyticsNotifications,
    analyticsReports,
  })

  const turnstileEnabled =
    process.env.ENABLE_TURNSTILE === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true'

  const quickLinks = [
    { label: 'Moderation Queue', href: '/admin/moderation' },
    { label: 'Reports', href: '/admin/collections/reports' },
    { label: 'Audit Logs', href: '/admin/collections/audit-logs' },
    { label: 'Boards', href: '/admin/collections/boards' },
    { label: 'Site Settings', href: '/admin/globals/site-settings' },
    { label: 'Announcements', href: '/admin/collections/announcements' },
    { label: 'Advertisements', href: '/admin/collections/advertisements' },
    { label: 'Users', href: '/admin/collections/users' },
  ]

  return {
    stats: {
      todayPosts: todayPosts.totalDocs,
      todayComments: todayComments.totalDocs,
      openReports: openReports.totalDocs,
      reviewingReports: reviewingReports.totalDocs,
      newUsers: newUsers.totalDocs,
      totalBookmarks: totalBookmarks.totalDocs,
      draftPosts: draftPosts.totalDocs,
      deletedPosts: deletedPosts.totalDocs,
      notificationsToday: notificationsToday.totalDocs,
      anonymousPostsToday: anonymousPostsToday.totalDocs,
    },
    moderation: {
      recentReports,
    },
    activity: {
      recentAuditLogs,
    },
    content: {
      latestPosts,
      recentComments,
    },
    health: {
      turnstileEnabled,
    },
    analytics,
    quickLinks,
  }
}