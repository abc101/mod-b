'use client'

import { useState, useTransition } from 'react'
import { deleteComment, updateComment } from './edit/actions'
import LocalTime from '@/components/LocalTime'
import CommentForm from './CommentForm'
import UserDisplay from '@/components/UserDisplay'
import { useAnonymousAccess } from '@/components/AnonymousAccessProvider'
import ReportButton from '@/components/ReportButton'
import type { Comment, User } from '@/types/payload'

type CommentItemComment = Comment & {
  author?: User | number | string | null
}

type Props = {
  comment: CommentItemComment
  replies: CommentItemComment[]
  userId?: number
  userRole?: string
  boardSlug: string
  postId: number
  isLoggedIn?: boolean
  allowAnonymousComment?: boolean
}

export default function CommentItem({
  comment,
  replies,
  userId,
  userRole,
  boardSlug,
  postId,
  isLoggedIn = false,
  allowAnonymousComment = false,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const { verifyResource } = useAnonymousAccess()

  const canManageComment = canManage(comment, userId, userRole)

  async function requireAnonymousAccess(targetComment: CommentItemComment) {
    const isAnonymous =
      !targetComment.author && !!targetComment.anonymousPasswordHash

    if (!isAnonymous) return true

    return verifyResource({
      type: 'comment',
      id: Number(targetComment.id),
      title: 'Comment Password',
      message: 'Please enter the password for this anonymous comment.',
      confirmLabel: 'Continue',
    })
  }

  async function handleDelete(targetComment: CommentItemComment, message: string) {
    if (!confirm(message)) return

    const ok = await requireAnonymousAccess(targetComment)
    if (!ok) return

    startTransition(async () => {
      try {
        await deleteComment(targetComment.id, postId, boardSlug)
        window.location.reload()
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete comment.')
      }
    })
  }

  async function startEdit(targetComment: CommentItemComment) {
    const ok = await requireAnonymousAccess(targetComment)
    if (!ok) return

    setEditingId(Number(targetComment.id))
    setEditingContent(targetComment.content || '')
  }

  async function submitEdit(targetComment: CommentItemComment) {
    if (!editingContent.trim()) {
      alert('Content is required.')
      return
    }

    startTransition(async () => {
      try {
        await updateComment(
          targetComment.id,
          postId,
          boardSlug,
          editingContent,
        )
        setEditingId(null)
        setEditingContent('')
        window.location.reload()
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to update comment.')
      }
    })
  }

  if (comment.isDeleted) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400 italic">
        This comment has been deleted.
      </div>
    )
  }

  return (
    <div>
     <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            <UserDisplay
              user={comment.author}
              anonymousAuthor={comment.anonymousAuthor ?? undefined}
            />
          </span>


          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              <LocalTime dateString={comment.createdAt} />
            </span>
             <ReportButton targetType="comment" targetId={comment.id} />

            {(isLoggedIn || allowAnonymousComment) && (
              <button
                type="button"
                onClick={() => setShowReplyForm((prev) => !prev)}
                className="text-xs px-2 py-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Reply
              </button>
            )}

            {canManageComment && (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startEdit(comment)}
                  className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(comment, 'Delete this comment?')}
                  className="text-xs px-2 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {editingId === comment.id ? (
          <InlineEditForm
            value={editingContent}
            onChange={setEditingContent}
            onCancel={() => {
              setEditingId(null)
              setEditingContent('')
            }}
            onSubmit={() => submitEdit(comment)}
            disabled={isPending}
          />
        ) : (
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>

      {showReplyForm && (
        <div className="ml-8 mt-2">
          <CommentForm
            postId={postId}
            boardSlug={boardSlug}
            parentCommentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            isLoggedIn={isLoggedIn}
            allowAnonymousComment={allowAnonymousComment}
          />
        </div>
      )}

      {replies.map((reply: any) => {
        if (reply.isDeleted) {
          return (
            <div
              key={reply.id}
              className="ml-8 mt-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-400 italic"
            >
              This reply has been deleted.
            </div>
          )
        }

        const canManageReply = canManage(reply, userId, userRole)

        return (
          <div
            key={reply.id}
            className="ml-8 mt-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                ↩{' '}
                <UserDisplay
                  user={reply.author}
                  anonymousAuthor={reply.anonymousAuthor ?? undefined}
                />
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  <LocalTime dateString={reply.createdAt} />
                </span>
                 <ReportButton targetType="comment" targetId={reply.id} />

                {canManageReply && (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startEdit(reply)}
                      className="text-xs px-2 py-1 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(reply, 'Delete this reply?')}
                      className="text-xs px-2 py-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingId === reply.id ? (
              <InlineEditForm
                value={editingContent}
                onChange={setEditingContent}
                onCancel={() => {
                  setEditingId(null)
                  setEditingContent('')
                }}
                onSubmit={() => submitEdit(reply)}
                disabled={isPending}
              />
            ) : (
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {reply.content}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function canManage(
  comment: CommentItemComment,
  userId?: number,
  userRole?: string,
) {
  return (
    userRole === 'admin' ||
    String(getRelationId(comment.author)) === String(userId || '') ||
    (!comment.author && !!comment.anonymousPasswordHash)
  )
}

function InlineEditForm({
  value,
  onChange,
  onCancel,
  onSubmit,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function getRelationId(
  value: User | number | string | null | undefined,
): number | string | undefined {
  if (!value) return undefined
  return typeof value === 'object' ? value.id : value
}