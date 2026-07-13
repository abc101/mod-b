import Link from 'next/link'
import Image from 'next/image'
import LocalTime from '@/components/LocalTime'
import NewBadge from '@/components/NewBadge'
import { getPostThumbnail } from '@/lib/post-thumbnail'
import type { GlobalBoardPost } from '@/types/global-board'
import { getRelation } from '@/lib/relations'

type Props = {
  title: string
  boardSlug: string
  posts: GlobalBoardPost[]
  showMore?: boolean
}

function YouTubeOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
        ▶
      </span>
    </div>
  )
}

export default function GlobalBoardCards({
  title,
  boardSlug,
  posts,
  showMore,
}: Props) {
  if (!posts.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {showMore && boardSlug && (
          <Link
            href={`/board/${boardSlug}`}
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            More +
          </Link>
        )}
      </div>

      <div className="p-3 space-y-3">
        {posts.map((post) => {
          const board = getRelation(post.board)
          const hrefBoardSlug = post.boardSlug || board?.slug || boardSlug
          const thumbnail = getPostThumbnail(post)

          if (!hrefBoardSlug) return null

          return (
            <Link
              key={post.id}
              href={`/board/${encodeURIComponent(hrefBoardSlug)}/${post.id}`}
              className="flex gap-3 rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
            >
              <div className="relative w-16 h-16 shrink-0 rounded bg-gray-100 overflow-hidden">
                {thumbnail?.url ? (
                  <>
                    <Image
                      src={thumbnail.url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized={thumbnail.source === 'youtube'}
                    />
                    {thumbnail.source === 'youtube' && <YouTubeOverlay />}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {board?.name && (
                  <div className="mb-1 text-[11px] font-medium text-blue-600">
                    [{board.name}]
                  </div>
                )}

                <div className="line-clamp-2 text-sm font-medium text-gray-900">
                  <NewBadge createdAt={post.createdAt} />
                  {post.title}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  <LocalTime dateString={post.createdAt} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}