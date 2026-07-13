export function extractFirstImageFromHtml(html?: string | null) {
  if (!html) return null
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null
}

export function extractYouTubeId(html?: string | null) {
  if (!html) return null

  const patterns = [
    /youtube-nocookie\.com\/embed\/([^"?&/]+)/i,
    /youtube\.com\/embed\/([^"?&/]+)/i,
    /youtube\.com\/watch\?[^"']*v=([^"&]+)/i,
    /youtu\.be\/([^"?&/]+)/i,
    /youtube\.com\/shorts\/([^"?&/]+)/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export function getPostThumbnail(post: any) {
  const featured =
    typeof post?.thumbnail === 'object' && post.thumbnail?.url
      ? post.thumbnail.url
      : null

  if (featured) {
    return {
      url: featured,
      source: 'thumbnail' as const,
      isAuto: false,
    }
  }

  const html = post?.contentHtml || ''

  const contentImage = extractFirstImageFromHtml(html)

  if (contentImage) {
    return {
      url: contentImage,
      source: 'content-image' as const,
      isAuto: true,
    }
  }

  const youtubeId = extractYouTubeId(html)

  if (youtubeId) {
    return {
      url: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      source: 'youtube' as const,
      isAuto: true,
      videoId: youtubeId,
    }
  }

  return null
}