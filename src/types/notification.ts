import type { Notification } from '@/payload-types'
import type { PaginatedDocs } from 'payload'

export type NotificationType =
  | 'comment'
  | 'reply'
  | 'mention'
  | 'qna_answer'
  | 'qna_accepted'
  | 'moderation'

export type NotificationList = PaginatedDocs<Notification>

export type NotificationDTO = {
  id: number
  type: NotificationType
  title: string
  message?: string | null
  href?: string | null
  isRead: boolean
  createdAt: string
}