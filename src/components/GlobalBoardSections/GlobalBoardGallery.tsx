import Link from 'next/link'
import Image from 'next/image'
import NewBadge from '@/components/NewBadge'
import type { GlobalBoardPost } from '@/types/global-board'
import { getRelation } from '@/lib/relations'

type Props = {
  title: string
  boardSlug: string
  posts: GlobalBoardPost[]
  showMore?: boolean
  gridColumns?: '1' | '2' | '3' | '4'
}

export default function GlobalBoardGallery({
  title,
  boardSlug,
  posts,
  showMore,
  gridColumns = '3',
}: Props) {
  if (!posts.length) return null

  const gridClass =
    gridColumns === '1'
      ? 'grid-cols-1'
      : gridColumns === '2'
        ? 'grid-cols-2'
        : gridColumns === '4'
          ? 'grid-cols-4'
          : 'grid-cols-3'

  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {showMore && boardSlug && (
          <Link href={`/board/${boardSlug}`} className="text-xs text-gray-500 hover:text-gray-900">
            More +
          </Link>
        )}
      </div>

      <div className={`grid ${gridClass} gap-1 p-2`}>
        {posts.map((post) => {
          const board = getRelation(post.board)
          const thumbnail = getRelation(post.thumbnail)
          const hrefBoardSlug = post.boardSlug || board?.slug || boardSlug

          if (!hrefBoardSlug) return null

          return (
            <Link
              key={post.id}
              href={`/board/${encodeURIComponent(hrefBoardSlug)}/${post.id}`}
              className="relative aspect-square rounded bg-gray-100 overflow-hidden group"
            >
              <div className="absolute left-1 top-1 z-10">
                <NewBadge createdAt={post.createdAt} />
              </div>

              {board?.name && (
                <div className="absolute bottom-1 left-1 z-10">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {board.name}
                  </span>
                </div>
              )}

              {thumbnail?.url ? (
                <Image
                  src={thumbnail.url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400 p-1 text-center">
                  {post.title}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}