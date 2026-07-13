import type { Post } from '@/types/payload'

export type PostDisplayPost = Post & {
  board?: {
    id: number | string
    slug?: string | null
    name?: string | null
  } | number | string | null
}

export type PostDisplayProps = {
  post: PostDisplayPost
  href?: string
  index?: number
  showRanking?: boolean
  showBoardName?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showViewCount?: boolean
  showThumbnail?: boolean
  showExcerpt?: boolean
}