import type { CollectionConfig } from 'payload'

export const Reports: CollectionConfig = {
  slug: 'reports',
  admin: {
    useAsTitle: 'reason',
    defaultColumns: ['targetType', 'targetId', 'reason', 'status', 'createdAt'],
    group: 'Moderation',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'targetType',
      type: 'select',
      required: true,
      options: [
        { label: 'Post', value: 'post' },
        { label: 'Comment', value: 'comment' },
      ],
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Spam', value: 'spam' },
        { label: 'Abuse / Harassment', value: 'abuse' },
        { label: 'Inappropriate Content', value: 'inappropriate' },
        { label: 'Personal Information', value: 'personal_info' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'details',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
    },
    {
      name: 'reporter',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'reporterIp',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        readOnly: true,
      },
    }
  ],
}