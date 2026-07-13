import type { CollectionConfig } from 'payload'

export const BookmarkItems: CollectionConfig = {
  slug: 'bookmark-items',
  admin: {
    useAsTitle: 'post',
    defaultColumns: ['folder', 'post', 'createdAt'],
    group: 'Community',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return {
        'folder.user': {
          equals: req.user?.id,
        },
      }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'bookmark-folders',
      required: true,
      index: true,
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
}