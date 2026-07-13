import type { Payload } from 'payload'

export type SearchResultType = 'post' | 'comment' | 'user' | 'board'

export type UnifiedSearchResult = {
  type: SearchResultType
  id: number | string
  title: string
  excerpt?: string
  href: string
  createdAt?: string
}

function stripHtml(value?: string | null) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function unifiedSearch({
  payload,
  query,
  limit = 8,
}: {
  payload: Payload
  query: string
  limit?: number
}): Promise<UnifiedSearchResult[]> {
  const keyword = query.trim()

  if (!keyword) return []

  const [posts, comments, users, boards] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { isDeleted: { not_equals: true } },
          { isSecret: { not_equals: true } },
          {
            or: [
              { title: { like: keyword } },
              { contentHtml: { like: keyword } },
              { 'tags.tag': { like: keyword } },
            ],
          },
        ],
      },
      limit,
      depth: 1,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'comments',
      where: {
        and: [
          { isDeleted: { not_equals: true } },
          { content: { like: keyword } },
        ],
      },
      limit,
      depth: 2,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'users',
      where: {
        or: [
          { name: { like: keyword } },
          { nickname: { like: keyword } },
        ],
      },
      limit,
      depth: 0,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'boards',
      where: {
        or: [
          { name: { like: keyword } },
          { slug: { like: keyword } },
          { description: { like: keyword } },
        ],
      },
      limit,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const postResults: UnifiedSearchResult[] = posts.docs.map((post: any) => {
    const boardSlug = post.board?.slug

    return {
      type: 'post',
      id: post.id,
      title: post.title || 'Untitled',
      excerpt: stripHtml(post.contentHtml).slice(0, 140),
      href: boardSlug
        ? `/board/${encodeURIComponent(boardSlug)}/${post.id}`
        : `/board/${post.id}`,
      createdAt: post.createdAt,
    }
  })

  const commentResults: UnifiedSearchResult[] = comments.docs
    .map((comment: any) => {
      const post = comment.post
      const boardSlug = post?.board?.slug

      if (!post || post.isSecret || post.status !== 'published') {
        return null
      }

      return {
        type: 'comment',
        id: comment.id,
        title: `Comment on ${post.title || 'post'}`,
        excerpt: stripHtml(comment.content).slice(0, 140),
        href:
          boardSlug && post?.id
            ? `/board/${encodeURIComponent(boardSlug)}/${post.id}`
            : '#',
        createdAt: comment.createdAt,
      }
    })
    .filter(Boolean) as UnifiedSearchResult[]

  const userResults: UnifiedSearchResult[] = users.docs.map((user: any) => ({
    type: 'user',
    id: user.id,
    title: user.name || user.nickname || user.email || 'User',
    excerpt: user.nickname ? `@${user.nickname}` : undefined,
    href: user.nickname
      ? `/u/${encodeURIComponent(user.nickname)}`
      : '#',
    createdAt: user.createdAt,
  }))

  const boardResults: UnifiedSearchResult[] = boards.docs.map((board: any) => ({
    type: 'board',
    id: board.id,
    title: board.name || board.slug,
    excerpt: board.description,
    href: `/board/${encodeURIComponent(board.slug)}`,
    createdAt: board.createdAt,
  }))

  return [
    ...postResults,
    ...commentResults,
    ...userResults,
    ...boardResults,
  ].slice(0, limit * 4)
}