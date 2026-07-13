import type { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'recipient', 'isRead', 'createdAt'],
    group: 'Community',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true

      return {
        recipient: {
          equals: req.user?.id,
        },
      }
    },
    create: () => false,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Comment', value: 'comment' },
        { label: 'Reply', value: 'reply' },
        { label: 'Q&A Answer', value: 'qna_answer' },
        { label: 'Q&A Accepted', value: 'qna_accepted' },
        { label: 'Moderation', value: 'moderation' },
        { label: 'Mention', value: 'mention' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'href',
      type: 'text',
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}