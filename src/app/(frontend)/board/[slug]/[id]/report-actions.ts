'use server'

import type {
  Comment,
  Post,
  Report,
  User,
} from '@/types/payload'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'

import {
  audit,
  getClientIp,
  getUserAgent,
} from '@/lib/community/server'
import { rateLimit } from '@/lib/rate-limit'
import { getRelation } from '@/lib/relations'

type ReportTargetType = 'post' | 'comment'

type ReportReason =
  | 'spam'
  | 'abuse'
  | 'inappropriate'
  | 'personal_info'
  | 'other'

type ReportMetadata = {
  title?: string
  commentContent?: string
  postId?: number
  postTitle?: string
  boardSlug?: string
  href?: string
}

const reportTargetTypes: ReportTargetType[] = [
  'post',
  'comment',
]

const reportReasons: ReportReason[] = [
  'spam',
  'abuse',
  'inappropriate',
  'personal_info',
  'other',
]

function isReportTargetType(
  value: string,
): value is ReportTargetType {
  return reportTargetTypes.some(
    (targetType) => targetType === value,
  )
}

function isReportReason(
  value: string,
): value is ReportReason {
  return reportReasons.some(
    (reason) => reason === value,
  )
}

export async function submitReport(formData: FormData) {
  const headers = await getHeaders()

  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const rawTargetType = String(
    formData.get('targetType') || '',
  )

  const targetId = String(
    formData.get('targetId') || '',
  ).trim()

  const rawReason = String(
    formData.get('reason') || '',
  )

  const details = String(
    formData.get('details') || '',
  ).trim()

  if (!isReportTargetType(rawTargetType)) {
    throw new Error('Invalid report target.')
  }

  const targetType: ReportTargetType = rawTargetType

  if (!targetId) {
    throw new Error('Report target is required.')
  }

  const numericTargetId = Number(targetId)

  if (!Number.isInteger(numericTargetId) || numericTargetId <= 0) {
    throw new Error('Invalid report target ID.')
  }

  if (!isReportReason(rawReason)) {
    throw new Error('Invalid report reason.')
  }

  const reason: ReportReason = rawReason

  const ip = getClientIp(headers)
  const userAgent = getUserAgent(headers)

  rateLimit({
    key: `report:${ip}`,
    limit: 5,
    windowMs: 60 * 1000,
  })

  let targetMeta: ReportMetadata = {}

  if (targetType === 'post') {
    const post = (await payload.findByID({
      collection: 'posts',
      id: numericTargetId,
      depth: 1,
      overrideAccess: true,
    })) as Post

    const board = getRelation(post.board)

    targetMeta = {
      title: post.title,
      boardSlug: board?.slug ?? undefined,
      href: board?.slug
        ? `/board/${encodeURIComponent(board.slug)}/${post.id}`
        : undefined,
    }
  }

  if (targetType === 'comment') {
    const comment = (await payload.findByID({
      collection: 'comments',
      id: numericTargetId,
      depth: 2,
      overrideAccess: true,
    })) as Comment

    const post = getRelation(comment.post)
    const board = getRelation(post?.board)

    targetMeta = {
      commentContent: comment.content,
      postId: post?.id,
      postTitle: post?.title,
      boardSlug: board?.slug ?? undefined,
      href:
        board?.slug && post?.id
          ? `/board/${encodeURIComponent(board.slug)}/${post.id}`
          : undefined,
    }
  }

  const report = (await payload.create({
    collection: 'reports',
    data: {
      targetType,
      targetId,
      reason,
      details: details || undefined,
      status: 'open',
      reporter: currentUser?.id,
      reporterIp: ip,
      userAgent,
      metadata: targetMeta,
    },
    overrideAccess: true,
    req: currentUser
      ? ({
          headers,
          user: currentUser,
        } as any)
      : undefined,
  })) as Report

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'report',
    resourceType: 'report',
    resource: report,
    message: `${targetType} reported`,
    metadata: {
      targetType,
      targetId,
      reason,
    },
  })

  return {
    success: true,
  }
}