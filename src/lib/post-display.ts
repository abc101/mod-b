import { getPostThumbnail } from '@/lib/post-thumbnail'

type BoardType =
  | 'list'
  | 'card'
  | 'gallery'
  | 'compact'
  | 'notice'
  | 'qna'
  | string

type DisplayPostOptions = {
  canView?: boolean
  boardType?: BoardType
}

export function isSecretHidden(post: any, canView = false) {
  return post?.isSecret && !canView
}

function getBoardType(post: any, boardType?: BoardType) {
  return boardType || post?.board?.boardType || post?.boardType || 'list'
}

function getExcerpt(post: any) {
  const source = post?.excerpt || post?.summary || post?.contentHtml || ''

  return String(source)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

export function getDisplayPost(
  post: any,
  options: DisplayPostOptions = {},
) {
  const canView = options.canView === true
  const boardType = getBoardType(post, options.boardType)
  const hidden = isSecretHidden(post, canView)

  if (!hidden) {
    return {
      isSecretHidden: false,
      boardType,
      title: post?.title || 'Untitled',
      excerpt: getExcerpt(post),
      thumbnail: getPostThumbnail(post),
      thumbnailAlt: post?.title || '',
    }
  }

  if (boardType === 'qna') {
    return {
      isSecretHidden: true,
      boardType,
      title: post?.title ? `🔒 ${post.title}` : '🔒 Private Question',
      excerpt: 'This is a private question.',
      thumbnail: null,
      thumbnailAlt: 'Private question',
    }
  }

  return {
    isSecretHidden: true,
    boardType,
    title: '🔒 Secret Post',
    excerpt: 'This is a secret post.',
    thumbnail: null,
    thumbnailAlt: 'Secret post',
  }
}