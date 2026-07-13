import type { Payload } from 'payload'
import { startOfTodayISO } from './helpers'

export async function getDashboardQueries(payload: Payload) {
  const today = startOfTodayISO()

  return Promise.all([
    payload.count({
      collection: 'posts',
      where: { createdAt: { greater_than: today } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'comments',
      where: { createdAt: { greater_than: today } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'reports',
      where: { status: { equals: 'open' } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'reports',
      where: { status: { equals: 'reviewing' } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'users',
      where: { createdAt: { greater_than: today } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'bookmark-items',
      overrideAccess: true,
    }),

    payload.count({
      collection: 'posts',
      where: { status: { equals: 'draft' } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'posts',
      where: { status: { equals: 'deleted' } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'notifications',
      where: { createdAt: { greater_than: today } },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'posts',
      where: {
        and: [
          { createdAt: { greater_than: today } },
          { anonymousAuthor: { exists: true } },
        ],
      },
      overrideAccess: true,
    }),

    payload.find({
      collection: 'reports',
      where: { status: { in: ['open', 'reviewing'] } },
      sort: '-createdAt',
      limit: 8,
      depth: 1,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'audit-logs',
      sort: '-createdAt',
      limit: 12,
      depth: 1,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { isDeleted: { not_equals: true } },
        ],
      },
      sort: '-createdAt',
      limit: 8,
      depth: 1,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'comments',
      where: { isDeleted: { not_equals: true } },
      sort: '-createdAt',
      limit: 8,
      depth: 2,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      limit: 500,
      depth: 1,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'comments',
      limit: 500,
      depth: 2,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'notifications',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    }),

    payload.find({
      collection: 'reports',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    }),
  ])
}