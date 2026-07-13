import type {
  BookmarkFolder,
  BookmarkItem,
} from '@/payload-types'

import type { PaginatedDocs } from 'payload'

export type BookmarkFolderList =
  PaginatedDocs<BookmarkFolder>

export type BookmarkItemList =
  PaginatedDocs<BookmarkItem>

export type BookmarkFolderDTO = {
  id: number
  name: string
  isDefault: boolean
  order: number
}

export type BookmarkDTO = {
  id: number
  folderId: number
  folderName: string
  postId: number
  title: string
  excerpt?: string
  boardSlug: string
  createdAt: string
}