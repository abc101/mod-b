import type {
  Board,
  Comment,
  Post,
  User,
} from '@/payload-types'

import type { PaginatedDocs } from 'payload'

export type BoardList =
  PaginatedDocs<Board>

export type PostList =
  PaginatedDocs<Post>

export type CommentList =
  PaginatedDocs<Comment>

export type CommunityUser = Pick<
  User,
  'id' | 'nickname' | 'name'
>

export type PostSummaryDTO = {
  id: number
  title: string
  excerpt?: string
  boardSlug: string
  boardName: string
  author: CommunityUser | null
  commentCount: number
  likeCount: number
  viewCount: number
  createdAt: string
}

export type CommentSummaryDTO = {
  id: number
  content: string
  postId: number
  author: CommunityUser | null
  createdAt: string
}

export type PostCreateData = {
  title: string
  board: number
  status: 'published' | 'draft'

  author?: number

  isDeleted?: boolean
  isNotice?: boolean
  isSecret?: boolean

  contentHtml: string
  useHtmlContent: boolean

  tags?: {
    tag: string
  }[]

  attachments?: {
    file: number
  }[]

  thumbnail?: number

  anonymousAuthor?: string
  anonymousIp?: string
  anonymousUserAgent?: string
  anonymousPasswordHash?: string
}