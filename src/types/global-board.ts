import type { Board, Comment, Post, User } from '@/types/payload'

export type GlobalBoardPost = Post & {
  board?: Board | number | string | null
  author?: User | number | string | null
  boardSlug?: string | null
}

export type GlobalBoardComment = Comment & {
  post?: GlobalBoardPost | number | string | null
  author?: User | number | string | null
}