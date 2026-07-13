import type { CollectionConfig } from 'payload'

export const BookmarkFolders: CollectionConfig = {
  slug: 'bookmark-folders',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'user', 'createdAt'],
    group: 'Community',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { user: { equals: req.user?.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Default',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}