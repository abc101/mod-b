import type { Metadata } from 'next'
import type { Board, Post, User } from '@/types/payload'

import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'

import configPromise from '@payload-config'
import BoardHeader from '@/components/BoardHeader'
import Pagination from '@/components/Pagination'
import BoardPageShell from '@/components/board/BoardPageShell'
import NoticePostList from '@/components/board/NoticePostList'
import PinnedNoticeList from '@/components/board/PinnedNoticeList'
import PostDisplayWithMiddleAd, {
  type DisplayType,
} from '@/components/board/PostDisplayWithMiddleAd'
import QnaPostList from '@/components/board/QnaPostList'
import { isBoardManager } from '@/lib/board-manager'
import { getBoardBySlug } from '@/lib/services/boards'
import { getNoticePosts, getPostsByBoard } from '@/lib/services/posts'
import { getMetadataBase } from '@/lib/siteUrl'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; search?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const payload = await getPayload({ config: configPromise })

  const board = (await getBoardBySlug({
    payload,
    slug: decodedSlug,
    activeOnly: false,
    depth: 0,
  })) as Board | null

  if (!board) {
    return {}
  }

  return {
    metadataBase: getMetadataBase(),
    title: board.name,
    description: board.description ?? undefined,
  }
}

export default async function BoardListPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)

  const { page = '1', search } = await searchParams

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const board = (await getBoardBySlug({
    payload,
    slug: decodedSlug,
    activeOnly: true,
    depth: 2,
  })) as Board | null

  if (!board) {
    notFound()
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1)
  const perPage = board.listSettings?.postsPerPage || 20
  const boardType = board.boardType || 'list'
  const gridColumns = board.skinSettings?.gridColumns || '3'

  const showAuthor = board.listSettings?.showAuthor !== false
  const showViewCount = board.listSettings?.showViewCount !== false
  const showDate = board.listSettings?.showDate !== false

  const allowWrite = board.writeSettings?.allowWrite || 'member'
  const allowAnonymous = board.writeSettings?.allowAnonymous === true

  const showWrite =
    (allowWrite === 'member' && !!currentUser) ||
    (allowWrite === 'admin' && currentUser?.role === 'admin') ||
    (allowWrite === 'manager' &&
      !!currentUser &&
      (currentUser.role === 'admin' ||
        isBoardManager(currentUser, board))) ||
    (!currentUser && allowAnonymous)

  const pinnedNoticesEnabled =
    board.announcementSettings?.enablePinnedNotices !== false

  const shouldLoadPinnedNotices =
    boardType !== 'notice' && pinnedNoticesEnabled

  const configuredPinnedNoticeLimit =
    board.announcementSettings?.maxPinnedNotices ?? 5

  const pinnedNoticeLimit = Math.min(
    5,
    Math.max(1, Math.trunc(configuredPinnedNoticeLimit)),
  )

  const notices = shouldLoadPinnedNotices
    ? await getNoticePosts({
        payload,
        boardId: board.id,
        limit: pinnedNoticeLimit,
      })
    : { docs: [], totalDocs: 0 }

  const posts = await getPostsByBoard({
    payload,
    boardId: board.id,
    page: currentPage,
    limit: perPage,
    search,
    includeNotices:
      boardType === 'notice' || !pinnedNoticesEnabled,
  })

  const middleAds = await getBoardMiddleAds({
    payload,
    boardId: board.id,
  })

  const middlePosition = getMiddlePosition(middleAds)

  const supportsMiddleAd = ['list', 'card', 'gallery', 'compact'].includes(
    boardType,
  )

  const shouldShowMiddleAd =
    supportsMiddleAd &&
    middleAds.docs.length > 0 &&
    posts.docs.length > middlePosition

  const firstPosts = shouldShowMiddleAd
    ? posts.docs.slice(0, middlePosition)
    : posts.docs

  const secondPosts = shouldShowMiddleAd
    ? posts.docs.slice(middlePosition)
    : []

  const totalPages = posts.totalPages || 1

  const header = (
    <BoardHeader
      title={board.name}
      description={board.description ?? undefined}
      search={search}
      showSearch
      showWrite={showWrite}
      writeHref={`/board/${encodedSlug}/write`}
    />
  )

  const pagination = (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      basePath={`/board/${encodedSlug}`}
      search={search}
    />
  )

  return (
    <BoardPageShell boardId={board.id} header={header}>
      {shouldLoadPinnedNotices && (
        <PinnedNoticeList
          posts={notices.docs as Post[]}
          boardSlug={encodedSlug}
          showAuthor={showAuthor}
          showDate={showDate}
          showViewCount={showViewCount}
        />
      )}

      {boardType === 'notice' ? (
        <NoticePostList
          posts={posts.docs as Post[]}
          boardSlug={encodedSlug}
        />
      ) : boardType === 'qna' ? (
        <QnaPostList
          posts={posts.docs as Post[]}
          boardSlug={encodedSlug}
        />
      ) : (
        <PostDisplayWithMiddleAd
          posts={posts.docs as Post[]}
          firstPosts={firstPosts as Post[]}
          secondPosts={secondPosts as Post[]}
          displayType={boardType as DisplayType}
          gridColumns={gridColumns}
          encodedSlug={encodedSlug}
          boardId={board.id}
          showAuthor={showAuthor}
          showDate={showDate}
          showViewCount={showViewCount}
          shouldShowMiddleAd={shouldShowMiddleAd}
        />
      )}

      {pagination}
    </BoardPageShell>
  )
}

async function getBoardMiddleAds({
  payload,
  boardId,
}: {
  payload: any
  boardId: number | string
}) {
  const ads = await payload.find({
    collection: 'advertisements',
    where: {
      and: [
        { positions: { contains: 'board-middle' } },
        { isActive: { equals: true } },
      ],
    },
    sort: 'order',
    depth: 1,
    limit: 1,
  })

  const now = new Date().toISOString()

  const activeAds = ads.docs.filter((ad: any) => {
    const startsOk = !ad.startDate || ad.startDate <= now
    const endsOk = !ad.endDate || ad.endDate >= now

    const targetBoards = ad.targetBoards || []
    const boardOk =
      !Array.isArray(targetBoards) ||
      targetBoards.length === 0 ||
      targetBoards.some((targetBoard: any) => {
        const targetId =
          typeof targetBoard === 'object' ? targetBoard.id : targetBoard

        return String(targetId) === String(boardId)
      })

    return startsOk && endsOk && boardOk
  })

  return {
    ...ads,
    docs: activeAds,
  }
}

function getMiddlePosition(ads: any) {
  const firstAd = ads?.docs?.[0]
  const value = Number(firstAd?.middlePosition || 5)

  return Number.isFinite(value) && value > 0 ? value : 5
}
