import type {
    Report,
    Post,
    Comment,
    AuditLog
} from '@/types/payload'

import type { PaginatedDocs } from 'payload'

export type CountItem = {
  key: string | number
  count: number
}

export type DashboardStats = {
  todayPosts: number
  todayComments: number
  openReports: number
  reviewingReports: number
  newUsers: number
  totalBookmarks: number
  draftPosts: number
  deletedPosts: number
  notificationsToday: number
  anonymousPostsToday: number
}

export type DashboardAnalytics = {
  topBoards: CountItem[]
  activeUsers: CountItem[]
  trendingTags: CountItem[]
  notificationStats: CountItem[]
  reportStats: CountItem[]
}

export type DashboardHealth = {
  turnstileEnabled: boolean
}

export type DashboardQuickLink = {
  label: string
  href: string
}

export type DashboardData = {
  stats: DashboardStats
  moderation: {
      recentReports: PaginatedDocs<Report>
  }

  activity: {
      recentAuditLogs: PaginatedDocs<AuditLog>
  }

  content: {

      latestPosts: PaginatedDocs<Post>
      recentComments: PaginatedDocs<Comment>

  }
  health: DashboardHealth
  analytics: DashboardAnalytics
  quickLinks: DashboardQuickLink[]
}