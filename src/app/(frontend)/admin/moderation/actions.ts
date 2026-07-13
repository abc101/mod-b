'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { audit } from '@/lib/community/server'

async function assertModerator() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user || !['admin', 'manager'].includes((user as any).role)) {
    throw new Error('No permission.')
  }

  return { payload, headers, user }
}

export async function updateReportStatus(
  reportId: number,
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed',
) {
  const { payload, headers, user } = await assertModerator()

  const report = await payload.findByID({
    collection: 'reports',
    id: reportId,
    depth: 1,
    overrideAccess: true,
  }) as any

  if (!report) throw new Error('Report not found.')

  const updatedReport = await payload.update({
    collection: 'reports',
    id: reportId,
    data: {
      status,
    },
    overrideAccess: true,
    req: { headers, user } as any,
  }) as any

  await audit({
    payload,
    headers,
    user,
    action: 'moderate',
    resourceType: 'report',
    resource: updatedReport,
    message: `Report marked as ${status}`,
    metadata: {
      targetType: report.targetType,
      targetId: report.targetId,
      previousStatus: report.status,
      nextStatus: status,
    },
  })

  revalidatePath('/admin/moderation')
}

export async function deleteReportedTarget(reportId: number) {
  const { payload, headers, user } = await assertModerator()

  const report = await payload.findByID({
    collection: 'reports',
    id: reportId,
    depth: 1,
    overrideAccess: true,
  }) as any

  if (!report) throw new Error('Report not found.')

  if (report.targetType === 'post') {
    const post = await payload.findByID({
      collection: 'posts',
      id: Number(report.targetId),
      depth: 1,
      overrideAccess: true,
    }) as any

    if (!post) throw new Error('Post not found.')

    const updatedPost = await payload.update({
      collection: 'posts',
      id: post.id,
      data: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: user.id,
        status: 'deleted',
      },
      overrideAccess: true,
      req: { headers, user } as any,
    }) as any

    await audit({
      payload,
      headers,
      user,
      action: 'moderate',
      resource: updatedPost,
      message: 'Reported post deleted by moderator',
      metadata: {
        reportId: report.id,
        reason: report.reason,
      },
    })
  }

  if (report.targetType === 'comment') {
    const comment = await payload.findByID({
      collection: 'comments',
      id: Number(report.targetId),
      depth: 1,
      overrideAccess: true,
    }) as any

    if (!comment) throw new Error('Comment not found.')

    const updatedComment = await payload.update({
      collection: 'comments',
      id: comment.id,
      data: {
        isDeleted: true,
      },
      overrideAccess: true,
      req: { headers, user } as any,
    }) as any

    await audit({
      payload,
      headers,
      user,
      action: 'moderate',
      resource: updatedComment,
      message: 'Reported comment deleted by moderator',
      metadata: {
        reportId: report.id,
        reason: report.reason,
      },
    })
  }

  const updatedReport = await payload.update({
    collection: 'reports',
    id: report.id,
    data: {
      status: 'resolved',
    },
    overrideAccess: true,
    req: { headers, user } as any,
  }) as any

  await audit({
    payload,
    headers,
    user,
    action: 'moderate',
    resourceType: 'report',
    resource: updatedReport,
    message: 'Report resolved after deleting target',
    metadata: {
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
    },
  })

  revalidatePath('/admin/moderation')
}