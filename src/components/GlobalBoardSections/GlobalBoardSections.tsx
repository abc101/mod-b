import { getPayload } from 'payload'
import configPromise from '@payload-config'

import NoticeTicker from './NoticeTicker'
import GlobalBoardList from './GlobalBoardList'
import GlobalBoardCards from './GlobalBoardCards'
import GlobalBoardGallery from './GlobalBoardGallery'

import { getRecentComments } from '@/lib/services/comments'
import { CommentListRow } from '@/components/CommentDisplay'
import RecentCommentsTicker from './RecentCommentsTicker'

import {
  getLatestPosts,
  getTrendingPosts,
  getPopularPosts,
  getPostsByBoard,
} from '@/lib/services/posts'

import type {
  Advertisement,
  Board,
  SiteSetting,
} from '@/types/payload'
import type { PaginatedDocs } from 'payload'
import type {
  GlobalBoardComment,
  GlobalBoardPost,
} from '@/types/global-board'
import { getRelation, getRelationId } from '@/lib/relations'

type BoardSection = NonNullable<
  NonNullable<
    NonNullable<SiteSetting['homeSettings']>['globalBoardSettings']
  >['boardSections']
>[number]

export default async function GlobalBoardSections() {
  const payload = await getPayload({ config: configPromise })

  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  }) as SiteSetting

  const globalBoardSettings =
    settings?.homeSettings?.globalBoardSettings || {}

  const sections =
    globalBoardSettings.boardSections
      ?.filter((section) => {
        const sectionType = section.sectionType || 'board'

        if (['latest', 'trending', 'popular', 'recentComments', 'advertisement'].includes(sectionType)) {
          return true
        }

        return !!section?.board
      })
      ?.sort(
        (a: BoardSection, b: BoardSection) =>
          (a.order || 0) - (b.order || 0),
      ) || []

  if (sections.length === 0) return null

  return (
    <div className="space-y-4">
      {await Promise.all(
        sections.map(async (section, index) => {
          const sectionType = section.sectionType || 'board'
          const displayType = section.displayType || 'list'
          const gridColumns = section.gridColumns || '3'
          const limit = section.postCount || 5

          let boardSlug = ''
          let title = section.sectionTitle || '⚡ Latest Posts'

          if (sectionType === 'advertisement') {
            const ad = getRelation(section.advertisement)

            if (!ad || ad.isActive === false) return null

            const now = new Date().toISOString()
            const startsOk = !ad.startDate || ad.startDate <= now
            const endsOk = !ad.endDate || ad.endDate >= now

            if (!startsOk || !endsOk) return null

            const image = getRelation(ad.image)
            const href = ad.linkUrl || '#'

            return (
              <div
                key={section.id || index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {image?.url ? (
                  <a
                    href={href}
                    target={ad.linkTarget || '_self'}
                    rel={
                      ad.linkTarget === '_blank'
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    className="block"
                  >
                    <img
                      src={image.url}
                      alt={ad.title || 'Advertisement'}
                      className="w-full h-auto"
                    />
                  </a>
                ) : (
                  <div className="p-4 text-sm text-gray-400 text-center">
                    Advertisement
                  </div>
                )}
              </div>
            )
          }

          let posts: PaginatedDocs<GlobalBoardPost> | null = null

          if (sectionType === 'latest') {
            title = section.sectionTitle || '⚡ Latest Posts'

            posts = await getLatestPosts({
              payload,
              postCount: limit,
              filterBoards: section.boards || [],
              depth: 1,
            })
          }

          if (sectionType === 'trending') {
            title = section.sectionTitle || '🔥 Trending Posts'

            posts = await getTrendingPosts({
              payload,
              postCount: limit,
              filterBoards: section.boards || [],
              depth: 1,
            })
          }

          if (sectionType === 'popular') {
            title = section.sectionTitle || '⭐ Popular Posts'

            posts = await getPopularPosts({
              payload,
              postCount: limit,
              filterBoards: section.boards || [],
              depth: 1,
            })
          }

          if (sectionType === 'board') {
            const boardId = getRelationId(section.board)

            if (typeof boardId !== 'number') {
              return null
            }

            let selectedBoard = getRelation(section.board)

            if (!selectedBoard) {
              selectedBoard = await payload.findByID({
                collection: 'boards',
                id: boardId,
                depth: 0,
                overrideAccess: true,
              })
            }

            if (!selectedBoard?.slug || selectedBoard.isActive === false) {
              return null
            }

            let boardName = ''
            
            boardSlug = selectedBoard.slug
            boardName = selectedBoard.name || selectedBoard.slug

            posts = await getPostsByBoard({
              payload,
              boardId,
              limit,
              includeNotices: true,
              depth: 1,
            })
          }
          
          if (sectionType === 'recentComments') {
           title = section.sectionTitle || '💬 Recent Comments'

            const comments = await getRecentComments({
              payload,
              limit,
              filterBoards: section.boards || [],
              depth: 2,
            })

            if (!comments.docs.length) return null

            if (displayType === 'ticker') {
              return (
                <RecentCommentsTicker
                  key={section.id || index}
                  title={title}
                  comments={comments.docs}
                  intervalMs={4000}
                />
              )
            }

            return (
              <section
                key={section.id || index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                </div>

                <ul className="divide-y divide-gray-100">
                  {comments.docs.map((comment) => (
                    <CommentListRow
                      key={comment.id}
                      comment={comment}
                      showBoardName
                      showAuthor
                      showDate
                    />
                  ))}
                </ul>
              </section>
            )
          } 

          if (!posts || posts.docs.length === 0) return null

          const mappedPosts = posts.docs

          if (displayType === 'ticker') {
            return (
              <NoticeTicker
                key={section.id || index}
                title={title}
                boardSlug={boardSlug}
                intervalMs={4000}
                posts={mappedPosts.map((post: any) => {
                  const postBoard =
                    typeof post.board === 'object' ? post.board : null

                  return {
                    id: post.id,
                    title: post.title,
                    createdAt: post.createdAt,
                    boardSlug: postBoard?.slug || boardSlug,
                  }
                })}
              />
            )
          }

          if (displayType === 'list') {
            return (
              <GlobalBoardList
                key={section.id || index}
                title={title}
                boardSlug={boardSlug}
                posts={mappedPosts}
              />
            )
          }

          if (displayType === 'card') {
            return (
              <GlobalBoardCards
                key={section.id || index}
                title={title}
                boardSlug={boardSlug}
                posts={mappedPosts}
              />
            )
          }

          if (displayType === 'gallery') {
            return (
              <GlobalBoardGallery
                key={section.id || index}
                title={title}
                boardSlug={boardSlug}
                posts={mappedPosts}
                gridColumns={gridColumns}
              />
            )
          }

          return null
        }),
      )}
    </div>
  )
}