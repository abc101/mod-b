export function isAdVisibleForBoard(ad: any, boardId?: number | string) {
  if (!boardId) return true

  const targetBoards = ad.targetBoards || []

  if (!Array.isArray(targetBoards) || targetBoards.length === 0) {
    return true
  }

  return targetBoards.some((board: any) => {
    const targetId = typeof board === 'object' ? board.id : board
    return String(targetId) === String(boardId)
  })
}

export function isAdActiveByDate(ad: any, now = new Date().toISOString()) {
  const startsOk = !ad.startDate || ad.startDate <= now
  const endsOk = !ad.endDate || ad.endDate >= now
  return startsOk && endsOk
}
