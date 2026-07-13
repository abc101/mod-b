import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'

import Pagination from '@/components/Pagination'
import EmptyState from '@/components/EmptyState'
import {
  PostListRow,
  PostGrid,
} from '@/components/PostDisplay'
import { getPostsByTag } from '@/lib/services/posts'

type Props = {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  return {
    title: `#${decodedTag}`,
  }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params
  const { page = '1' } = await searchParams

  const decodedTag = decodeURIComponent(tag)
  const currentPage = Math.max(1, Number(page) || 1)

  const payload = await getPayload({ config: configPromise })

  const posts = await getPostsByTag({
    payload,
    tag: decodedTag,
    page: currentPage,
    limit: 20,
    depth: 2,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">#{decodedTag}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          #{decodedTag}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {posts.totalDocs} posts
        </p>
      </div>

      {posts.docs.length === 0 ? (
        <EmptyState message="No posts found for this tag." />
      ) : (
        <PostGrid displayType="list">
          {posts.docs.map((post: any, index: number) => (
            <PostListRow
              key={post.id}
              post={post}
              index={index}
              showRanking={false}
              showBoardName
              showAuthor
              showDate
              showViewCount
            />
          ))}
        </PostGrid>
      )}

      <Pagination
        basePath={`/tag/${encodeURIComponent(decodedTag)}`}
        currentPage={posts.page || currentPage}
        totalPages={posts.totalPages || 1}
      />
    </div>
  )
}