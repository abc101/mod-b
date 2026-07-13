import type { Board, User } from '@/types/payload'
import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers.js'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import configPromise from '@payload-config'
import { isBoardManager } from '@/lib/board-manager'
import WriteForm from './WriteForm'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function WritePage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  // Fetch board
  const boards = await payload.find({
    collection: 'boards',
    where: { 
      and: [
        { slug: { equals: decodedSlug } }, 
        { isActive: { equals: true } }] },
    limit: 1,
  })

  const board = boards.docs[0] as Board
  if (!board) notFound()

  const allowWrite = board.writeSettings?.allowWrite || 'member'
  const allowAnonymous = board.writeSettings?.allowAnonymous === true

  const canWrite =
    (allowWrite === 'member' && !!user) ||
    (allowWrite === 'admin' && (user as any)?.role === 'admin') ||
    (
      allowWrite === 'manager' &&
      !!user &&
      (
        currentUser?.role === 'admin' ||
        isBoardManager(user, board)
      )
    ) ||
    (!user && allowAnonymous)

  if (!canWrite) {
    redirect(`/board/${encodedSlug}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>›</span>
        <Link href={`/board/${encodedSlug}`} className="hover:text-gray-900">{board.name}</Link>
        <span>›</span>
        <span className="text-gray-900">Write</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Write Post</h1>
        <WriteForm
          boardSlug={encodedSlug}
          boardId={board.id}
          userRole={currentUser?.role ?? null}
          allowAttachment={board.writeSettings?.allowAttachment !== false}
          maxAttachments={board.writeSettings?.maxAttachments || 5}
          allowAnonymous={allowAnonymous}
        />
      </div>
    </div>
  )
}
