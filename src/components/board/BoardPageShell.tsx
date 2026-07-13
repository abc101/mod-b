import type { ReactNode } from 'react'

import BoardAdvertisements from '@/components/Advertisements/BoardAdvertisements'

type Props = {
  boardId: number | string
  header: ReactNode
  children: ReactNode
}

export default function BoardPageShell({
  boardId,
  header,
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <BoardAdvertisements
        position="board-top"
        boardId={boardId}
        className="my-6"
      />

      {header}

      {children}

      <BoardAdvertisements
        position="board-bottom"
        boardId={boardId}
        className="my-6"
      />
    </div>
  )
}
