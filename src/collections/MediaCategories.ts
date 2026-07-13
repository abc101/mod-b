import type { CollectionConfig } from 'payload'

export const MediaCategories: CollectionConfig = {
  slug: 'media-categories',

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },

  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Examples: post-image, attachment, hero',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}