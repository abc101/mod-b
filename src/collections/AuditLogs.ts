import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'resourceType', 'resourceId', 'actorType', 'createdAt'],
    group: 'System',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Restore', value: 'restore' },
        { label: 'Verify', value: 'verify' },
        { label: 'Report', value: 'report' },
        { label: 'Moderate', value: 'moderate' },
      ],
    },
    {
      name: 'resourceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Post', value: 'post' },
        { label: 'Comment', value: 'comment' },
        { label: 'User', value: 'user' },
        { label: 'Board', value: 'board' },
        { label: 'Report', value: 'report' },
      ],
    },
    {
      name: 'resourceId',
      type: 'text',
      required: true,
    },
    {
      name: 'actorType',
      type: 'select',
      required: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Anonymous', value: 'anonymous' },
        { label: 'System', value: 'system' },
      ],
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'anonymousAuthor',
      type: 'text',
    },
    {
      name: 'ip',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}