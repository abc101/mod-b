import type { Board, Post, User } from '@/types/payload'

import { getPayload } from 'payload'
import type { Metadata as NextMetadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { headers as getHeaders } from 'next/headers'
import { cookies } from 'next/headers'

import configPromise from '@payload-config'
import LocalTime from '@/components/LocalTime'
import BoardAdvertisements from '@/components/Advertisements/BoardAdvertisements'
import { isBoardManager } from '@/lib/board-manager'
import { getMetadataBase } from '@/lib/siteUrl'
import { slugifyTitle } from '@/lib/slugify'
import { getPostThumbnail } from '@/lib/post-thumbnail'
import UserDisplay from '@/components/UserDisplay'
import { canWriteComment } from '@/lib/board-permissions'
import { PostCardRow, PostGrid } from '@/components/PostDisplay'
import PostActions from '@/components/PostActions'
import { getRelation, getRelationId } from '@/lib/relations'

import { getPostById, getRelatedPosts } from '@/lib/services/posts'
import {
  getCommentsByPost,
  getRepliesByPost,
} from '@/lib/services/comments'

import AcceptAnswerButton from '../AcceptAnswerButton'
import CommentForm from '../CommentForm'
import CommentItem from '../CommentItem'
import LikeButton from '../LikeButton'
import ManagerPostActions from '../edit/ManagerPostActions'
import ViewCountUpdater from '../ViewCountUpdater'
import QnaAnswerButton from '../QnaAnswerButton'

import { canManagePost as canManagePostPermission } from '@/lib/community/server'
import { getDisplayPost } from '@/lib/post-display'
import ReportButton from '@/components/ReportButton'
import BookmarkButton from '@/components/BookmarkButton'
import { isPostBookmarked } from '@/lib/community/server'

function normalizeMetaText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function getLexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const record = node as {
    text?: unknown
    children?: unknown[]
  }

  const ownText =
    typeof record.text === 'string'
      ? record.text
      : ''

  const childText =
    Array.isArray(record.children)
      ? record.children.map(getLexicalText).join(' ')
      : ''

  return `${ownText} ${childText}`.trim()
}

function getPostMetaDescription(post: Post) {
  // Never expose private post contents in metadata.
  if (post.isSecret) {
    return undefined
  }

  const rawText = post.contentHtml
    ? normalizeMetaText(post.contentHtml)
    : normalizeMetaText(
        getLexicalText(post.content?.root),
      )

  if (!rawText) {
    return undefined
  }

  const maxLength = 160

  if (rawText.length <= maxLength) {
    return rawText
  }

  return `${rawText.slice(0, maxLength - 1).trimEnd()}…`
}

type Props = {
  params: Promise<{ slug: string; id: string; postSlug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: Props): Promise<NextMetadata> {
  const { slug, id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const post = (await getPostById({
    payload,
    id: parseInt(id, 10),
    depth: 1,
    overrideAccess: true,
  })) as Post | null

  if (!post) return {}

  if (post.status === 'draft') {
    const postAuthorId = getRelationId(post.author)

    const canViewDraft =
      !!currentUser &&
      (currentUser.role === 'admin' ||
        String(postAuthorId) === String(currentUser.id))

    if (!canViewDraft) return {}
  }

  const thumbnail = getPostThumbnail(post)
  const canonicalSlug = slugifyTitle(post.title)

  const canonicalPath =
    `/board/${encodeURIComponent(slug)}` +
    `/${post.id}` +
    `/${encodeURIComponent(canonicalSlug)}`

  const description = getPostMetaDescription(post)

  return {
    metadataBase: getMetadataBase(),

    title: post.title,

    ...(description ? { description } : {}),

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: 'article',
      title: post.title,
      url: canonicalPath,

      ...(description ? { description } : {}),

      ...(thumbnail?.url
        ? {
            images: [{ url: thumbnail.url }],
          }
        : {}),
    },

    twitter: {
      card: thumbnail?.url ? 'summary_large_image' : 'summary',
      title: post.title,

      ...(description ? { description } : {}),

      ...(thumbnail?.url
        ? {
            images: [thumbnail.url],
          }
        : {}),
    },
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { slug, id, postSlug } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const post = (await getPostById({
    payload,
    id: parseInt(id, 10),
    depth: 2,
    overrideAccess: true,
  })) as Post | null

  if (!post) notFound()

  if (post.status === 'draft') {
    const postAuthorId = getRelationId(post.author)
    const canViewDraft =
      !!currentUser &&
      (currentUser.role === 'admin' ||
        String(postAuthorId) === String(currentUser.id))

    if (!canViewDraft) notFound()
  }

  const board = getRelation(post.board) as Board | null
  if (!board) notFound()

  const boardType = board.boardType || 'list'
  const isQnA = boardType === 'qna'
  const isNoticeBoard = boardType === 'notice'

  const thumbnail = getPostThumbnail(post)
  const canonicalSlug = slugifyTitle(post.title)

  if (decodeURIComponent(postSlug) !== canonicalSlug) {
    redirect(`/board/${slug}/${post.id}/${encodeURIComponent(canonicalSlug)}`)
  }

  const canViewSecretPost =
    !post.isSecret ||
    (await canManagePostPermission({
      user: currentUser,
      post,
    }))

  if (!canViewSecretPost) {
    const isAnonymousPost = !post.author && !!post.anonymousPasswordHash

    if (isAnonymousPost) {
      redirect(`/board/${slug}/${post.id}/verify`)
    }

    notFound()
  }

  const displayPost = getDisplayPost(post, {
    boardType,
    canView: canViewSecretPost,
  })

  const hideSecretContent = post.isSecret && !canViewSecretPost

  const cookieStore = await cookies()
  const viewedKey = `post_viewed_${id}`
  const hasViewed = cookieStore.get(viewedKey)

  const comments = await getCommentsByPost({
    payload,
    postId: post.id,
  })

  const replies = await getRepliesByPost({
    payload,
    postId: post.id,
  })

  const relatedPosts = await getRelatedPosts({
    payload,
    post,
    limit: 5,
    depth: 2,
  })

  const postAuthorId = getRelationId(post.author)

  const canManageByLogin =
    !!currentUser &&
    (currentUser.role === 'admin' ||
      String(postAuthorId) === String(currentUser.id))

  const isAnonymousPost = !post.author && !!post.anonymousPasswordHash
  const canShowPostActions = canManageByLogin || isAnonymousPost

  const canAcceptAnswer =
    !!currentUser &&
    (currentUser.role === 'admin' ||
      String(postAuthorId) === String(currentUser.id))

  const allowComment =
    !isNoticeBoard && board.writeSettings?.allowComment !== false

  const canManageQna =
    isQnA &&
    !!currentUser &&
    (currentUser.role === 'admin' || isBoardManager(currentUser, board))

  const postAuthor = getRelation(post.author)
  const isAdminPost = postAuthor?.role === 'admin'

  const canManagePost =
    !!currentUser &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'manager' &&
        !isAdminPost &&
        isBoardManager(currentUser, board)))

  const allowWrite = board.writeSettings?.allowWrite || 'member'
  const allowAnonymous = board.writeSettings?.allowAnonymous === true

  const canWrite =
    (allowWrite === 'member' && !!currentUser) ||
    (allowWrite === 'admin' && currentUser?.role === 'admin') ||
    (allowWrite === 'manager' &&
      !!currentUser &&
      (currentUser.role === 'admin' ||
        isBoardManager(currentUser, board))) ||
    (!currentUser && allowAnonymous)

  const sortedComments = isQnA
    ? [...comments.docs].sort((a, b) => {
        if (a.id === post.acceptedCommentId) return -1
        if (b.id === post.acceptedCommentId) return 1
        return 0
      })
    : comments.docs

  const showCommentForm = canWriteComment(currentUser, board)

  const displayViewCount = hasViewed
    ? post.viewCount || 0
    : (post.viewCount || 0) + 1

  const isBookmarked = await isPostBookmarked({
    payload,
    userId: currentUser?.id,
    postId: post.id,
  })

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-3 py-5 sm:px-4 sm:py-8">
      <ViewCountUpdater postId={post.id} currentCount={post.viewCount || 0} />

      <nav className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>›</span>
        <Link href={`/board/${slug}`} className="hover:text-gray-900">
          {board.name || slug}
        </Link>
        <span>›</span>
        <span className="text-gray-900 truncate">{displayPost.title}</span>
      </nav>

      {isQnA && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between gap-3 ${
            post.isAnswered
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}
        >
          <div>
            {post.isAnswered
              ? '✅ This question has been answered.'
              : '⏳ This question is waiting for an answer.'}
          </div>

          {canManageQna && (
            <QnaAnswerButton
              postId={post.id}
              slug={slug}
              isAnswered={post.isAnswered ?? undefined}
            />
          )}
        </div>
      )}

      <BoardAdvertisements
        position="post-top"
        boardId={board.id}
        className="my-6"
      />

      <article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {thumbnail?.url && (
          <div className="relative w-full aspect-video">
            <Image
              src={thumbnail.url}
              alt={displayPost.title}
              fill
              className="object-cover"
              priority
              unoptimized={thumbnail.source === 'youtube'}
            />

            {thumbnail.source === 'youtube' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white">
                  ▶
                </span>
              </div>
            )}
          </div>
        )}

        <div className="border-b border-gray-100 px-4 py-5 sm:px-6">
          <h1 className="min-w-0 break-words text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
            {post.isNotice && (
              <span className="mr-2 inline-block rounded bg-blue-500 px-1.5 py-0.5 align-middle text-xs text-white">
                Notice
              </span>
            )}

            {isQnA && (
              <span
                className={`mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-xs ${
                  post.isAnswered
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-400 text-white'
                }`}
              >
                {post.isAnswered ? 'Answered' : 'Pending'}
              </span>
            )}

            {displayPost.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
            <span>
              <UserDisplay
                user={post.author}
                anonymousAuthor={post.anonymousAuthor ?? undefined}
              />
            </span>

            <span>👁 {displayViewCount}</span>

            <LikeButton
              postId={post.id}
              initialLikes={post.likeCount || 0}
            />

            <LocalTime dateString={post.createdAt} showTime />
            <ReportButton targetType="post" targetId={post.id} />
          </div>

          <div className="mt-4 flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-4 sm:justify-end">
            <BookmarkButton
              postId={post.id}
              boardSlug={slug}
              initialBookmarked={isBookmarked}
              isLoggedIn={!!currentUser}
            />

            {canShowPostActions && (
              <PostActions
                post={post}
                boardSlug={slug}
                canManageByLogin={canManageByLogin}
              />
            )}

            {canManagePost && !post.isDeleted && (
              <ManagerPostActions
                postId={post.id}
                isNotice={post.isNotice ?? undefined}
              />
            )}
          </div>
        </div>

        <div className="min-h-48 min-w-0 max-w-full overflow-hidden px-4 py-6 sm:px-6">
          {hideSecretContent ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm font-medium text-gray-700">
                This is a private question.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Only the author or an authorized user can view this content.
              </p>
            </div>
          ) : post.contentHtml ? (
            <div
              className="prose prose-gray max-w-none break-words [&_img]:h-auto [&_img]:max-w-full [&_video]:h-auto [&_video]:max-w-full [&_iframe]:block [&_iframe]:!aspect-video [&_iframe]:!h-auto [&_iframe]:!max-w-full [&_iframe]:!w-full"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <div className="prose prose-gray max-w-none break-words whitespace-pre-wrap text-gray-800">
              {post.content?.root?.children?.map((node: any, idx: number) => (
                <p key={idx}>
                  {node.children?.map((child: any) => child.text).join('')}
                </p>
              ))}
            </div>
          )}
        </div>

        {!hideSecretContent && post.attachments && post.attachments.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Attachments
            </p>

            <ul className="space-y-1">
              {post.attachments.map((attachment, idx) => {
                const file = getRelation(attachment.file)
                if (!file?.url) return null

                return (
                  <li key={idx}>
                    <a
                      href={file.url}
                      className="text-sm text-blue-600 hover:underline"
                      download
                    >
                      📎 {file.filename || 'Download attachment'}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {post.tags?.some((tag) => typeof tag.tag === 'string' && tag.tag.trim()) && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3 sm:px-6">
            {post.tags
              .filter(
                (tag): tag is typeof tag & { tag: string } =>
                  typeof tag.tag === 'string' && tag.tag.trim().length > 0,
              )
              .map((tag, idx) => (
                <Link
                  key={`${tag.tag}-${idx}`}
                  href={`/tag/${encodeURIComponent(tag.tag)}`}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200"
                >
                  #{tag.tag}
                </Link>
              ))}
          </div>
        )}
      </article>

      <BoardAdvertisements
        position="post-bottom"
        boardId={board.id}
        className="my-6"
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link
          href={`/board/${slug}`}
          className="text-sm border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
        >
          ← List
        </Link>

        {canWrite && (
          <Link
            href={`/board/${slug}/write`}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Write
          </Link>
        )}
      </div>

      {relatedPosts.docs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Related Posts
          </h2>

          <PostGrid displayType="card" gridColumns="1">
            {relatedPosts.docs.map((relatedPost, index) => {
              const relatedBoard = getRelation(relatedPost.board)

              return (
                <PostCardRow
                  key={relatedPost.id}
                  post={relatedPost}
                  href={`/board/${relatedBoard?.slug || slug}/${relatedPost.id}`}
                  index={index}
                  showRanking={false}
                  showBoardName
                  showAuthor
                  showDate
                  showViewCount
                />
              )
            })}
          </PostGrid>
        </section>
      )}

      {allowComment && !hideSecretContent && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isQnA
              ? `Answers (${comments.totalDocs})`
              : `Comments (${comments.totalDocs})`}
          </h2>

          <div className="space-y-3">
            {sortedComments.map((comment) => {
              const commentReplies = replies.docs.filter(
                (reply) =>
                  String(getRelationId(reply.parentComment)) ===
                  String(comment.id),
              )

              const isAccepted = post.acceptedCommentId === comment.id

              return (
                <div
                  key={comment.id}
                  className={isAccepted ? 'ring-2 ring-green-400 rounded-lg' : ''}
                >
                  {isQnA && (
                    <div className="flex justify-end px-2 pt-2">
                      <AcceptAnswerButton
                        commentId={comment.id}
                        postId={post.id}
                        boardSlug={slug}
                        isAccepted={isAccepted}
                        canAccept={canAcceptAnswer}
                      />
                    </div>
                  )}

                  <CommentItem
                    comment={comment}
                    replies={commentReplies}
                    userId={currentUser?.id}
                    userRole={currentUser?.role}
                    boardSlug={slug}
                    postId={post.id}
                    isLoggedIn={!!currentUser}
                    allowAnonymousComment={
                      board.writeSettings?.allowAnonymousComment === true
                    }
                  />
                </div>
              )
            })}
          </div>

          {(() => {
            const allowAnonymousComment =
              board.writeSettings?.allowAnonymousComment === true

            const canShowCommentForm =
              (!!currentUser && showCommentForm) ||
              (!currentUser && allowAnonymousComment)

            return (
              <div className="mt-6">
                {isQnA && canShowCommentForm && (
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Write an Answer
                  </p>
                )}

                {canShowCommentForm ? (
                  <CommentForm
                    postId={post.id}
                    boardSlug={slug}
                    isLoggedIn={!!currentUser}
                    allowAnonymousComment={allowAnonymousComment}
                  />
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">
                      <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                      </Link>
                      {isQnA ? ' to write an answer.' : ' to write a comment.'}
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </section>
      )}
    </div>
  )
}
