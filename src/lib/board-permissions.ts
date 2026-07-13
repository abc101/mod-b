import type { Board, User } from '@/types/payload'

function getRelationId(
  value: number | string | { id: number | string } | null | undefined,
): number | string | undefined {
  if (!value) return undefined
  return typeof value === 'object' ? value.id : value
}

export function isBoardManager(
  user: User | null | undefined,
  board: Board | null | undefined,
): boolean {
  if (!user || !board) return false
  if (board.managerEnabled === false) return false

  return (
    Array.isArray(board.managers) &&
    board.managers.some((manager) => {
      return String(getRelationId(manager)) === String(user.id)
    })
  )
}

export function canWriteComment(
  user: User | null | undefined,
  board: Board | null | undefined,
): boolean {
  if (!user || !board) return false

  const allowComment = board.writeSettings?.allowComment !== false
  if (!allowComment) return false

  const allowCommentWrite = board.writeSettings?.allowCommentWrite || 'member'

  if (user.role === 'admin') return true
  if (allowCommentWrite === 'member') return true

  if (allowCommentWrite === 'manager') {
    return user.role === 'manager' && isBoardManager(user, board)
  }

  return false
}