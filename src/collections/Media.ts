import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { createdBy: { equals: req.user?.id } }
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'media-categories',
      hasMany: false,
      required: false,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],

  upload: {
    staticDir: 'media',

    mimeTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon',

      // Documents
      'application/pdf',
      'text/plain',

      // Microsoft Office
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/x-7z-compressed',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-gzip',
      'application/x-gtar',
    ],

    imageSizes: [
      {
        name: 'hero',
        width: 2400,
        height: 900,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'large',
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'medium',
        width: 1200,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      },
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        fit: 'cover',
        withoutEnlargement: true,
      },
    ],
  },
}