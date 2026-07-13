import { getRelation } from '@/lib/relations'
import type { PostDisplayPost } from './types'

export function getPostHref(post: PostDisplayPost, href?: string) {
  if (href) return href

  const board = getPostBoard(post)

  return `/board/${encodeURIComponent(board?.slug ?? 'board')}/${post.id}`
}

export function getPostBoard(post: PostDisplayPost) {
  return getRelation(post.board)
}