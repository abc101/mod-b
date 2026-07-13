'use client'

import { useState, useTransition } from 'react'
import {
  managerSoftDeletePost,
  managerToggleNoticePost,
} from './managerActions'

type Props = {
  postId: number | string
  isNotice?: boolean
}

export default function ManagerPostActions({ postId, isNotice }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleNotice = () => {
    setOpen(false)

    startTransition(async () => {
      try {
        await managerToggleNoticePost(postId, !isNotice)
        window.location.reload()
      } catch (err: any) {
        alert(err?.message || 'Failed to update notice status.')
      }
    })
  }

  const handleSoftDelete = () => {
    setOpen(false)

    if (!confirm('Delete this post?')) return

    startTransition(async () => {
      try {
        await managerSoftDeletePost(postId)
        window.location.reload()
      } catch (err: any) {
        alert(err?.message || 'Failed to delete post.')
      }
    })
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isPending}
        className="text-xs border border-gray-300 px-2.5 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Manage ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
          <button
            type="button"
            onClick={handleToggleNotice}
            disabled={isPending}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isNotice ? 'Unpin Notice' : 'Pin Notice'}
          </button>

          <button
            type="button"
            onClick={handleSoftDelete}
            disabled={isPending}
            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}