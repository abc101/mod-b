import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'post', 'author', 'createdAt'],
    group: 'Board Management',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { author: { equals: req.user?.id } }
    },
    delete: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { author: { equals: req.user?.id } }
    },
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      label: 'Post',
      relationTo: 'posts',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      label: 'Author',
      relationTo: 'users',
    },
    {
      name: 'anonymousAuthor',
      type: 'text',
      label: 'Anonymous Author Name',
    },
    {
      name: 'anonymousIp',
      type: 'text',
      label: 'Anonymous IP',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'anonymousPasswordHash',
      type: 'text',
      label: 'Anonymous Password Hash',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'anonymousUserAgent',
      type: 'text',
      label: 'Anonymous User Agent',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Comment Content',
      required: true,
    },
    {
      name: 'parentComment',
      type: 'relationship',
      label: 'Parent Comment (Reply)',
      relationTo: 'comments',
      admin: {
        description: 'Select parent comment for replies',
      },
    },
    {
      name: 'likeCount',
      type: 'number',
      label: 'Like Count',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      label: 'Deleted',
      defaultValue: false,
      admin: {
        description: 'Show "Deleted comment" message when checked',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !data.author) {
          data.author = req.user.id
        }
        return data
      },
    ],
  },
}
