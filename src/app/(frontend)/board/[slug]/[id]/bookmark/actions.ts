'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { toggleDefaultBookmark } from '@/lib/community/server'

export async function toggleBookmarkAction(
  postId: number,
  boardSlug: string,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    throw new Error('Login required.')
  }

  const bookmarked = await toggleDefaultBookmark({
    payload,
    userId: user.id,
    postId,
  })

  revalidatePath(`/board/${boardSlug}/${postId}`)
  revalidatePath('/my-page/bookmarks')

  return { bookmarked }
}