import { getPayload } from 'payload'
import configPromise from '@payload-config'
import EmptyState from '@/components/EmptyState'
import { getRecentComments } from '@/lib/services/comments'
import { CommentListRow } from '@/components/CommentDisplay'

type Props = {
  sectionTitle?: string
  commentCount?: number
  filterBoards?: { id: number }[]
  showBoardName?: boolean
  showAuthor?: boolean
  showDate?: boolean
}

export default async function RecentCommentsComponent({
  sectionTitle = 'Recent Comments',
  commentCount = 5,
  filterBoards = [],
  showBoardName = true,
  showAuthor = true,
  showDate = true,
}: Props) {
  const payload = await getPayload({ config: configPromise })

  const comments = await getRecentComments({
    payload,
    limit: commentCount,
    filterBoards,
    depth: 2,
  })

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {sectionTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          💬 {sectionTitle}
        </h2>
      )}

      {comments.docs.length === 0 ? (
        <EmptyState message="No comments yet." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {comments.docs.map((comment: any) => (
              <CommentListRow
                key={comment.id}
                comment={comment}
                showBoardName={showBoardName}
                showAuthor={showAuthor}
                showDate={showDate}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}