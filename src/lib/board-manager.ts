import type { Board, User } from '@/types/payload'

export function getId<T extends { id: number | string }>(
  value: number | string | T | null | undefined,
): number | string | undefined {
  return typeof value === 'object' ? value?.id : value
}

export function isBoardManager(
  user: User | null | undefined,
  board: Board | null | undefined,
) {
  if (!user || user.role !== 'manager') return false
  if (!board || board.managerEnabled === false) return false

  const managers = board.managers || []

  return managers.some((manager) => {
    return String(getId(manager)) === String(user.id)
  })
}