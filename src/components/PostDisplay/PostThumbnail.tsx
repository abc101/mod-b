import type { PostDisplayPost } from './types'
import Image from 'next/image'
import { getDisplayPost } from '@/lib/post-display'
import YouTubeOverlay from './YouTubeOverlay'

type Props = {
  post: PostDisplayPost
  className?: string
  imageClassName?: string
  sizes?: string
  fallback?: React.ReactNode
  priority?: boolean
  canView?: boolean
}

export default function PostThumbnail({
  post,
  className = 'relative aspect-video overflow-hidden bg-gray-100',
  imageClassName = 'object-cover',
  sizes = '(max-width: 768px) 100vw, 33vw',
  fallback,
  priority = false,
  canView = false,
}: Props) {
  const display = getDisplayPost(post, { canView })
  const thumbnail = display.thumbnail

  return (
    <div className={className}>
      {display.isSecretHidden ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-lg">🔒</span>
          <span className="text-[10px]">Secret</span>
        </div>
      ) : thumbnail?.url ? (
        <>
          <Image
            src={thumbnail.url}
            alt={display.thumbnailAlt}
            fill
            sizes={sizes}
            className={imageClassName}
            priority={priority}
            unoptimized={thumbnail.source === 'youtube'}
          />
          {thumbnail.source === 'youtube' && <YouTubeOverlay />}
        </>
      ) : (
        fallback || (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )
      )}
    </div>
  )
}