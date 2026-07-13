import type { CollectionConfig } from 'payload'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HeadingFeature,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'board', 'author', 'status', 'isDeleted', 'viewCount', 'createdAt'],
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
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'board',
      type: 'relationship',
      label: 'Board',
      relationTo: 'boards',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      label: 'Author',
      relationTo: 'users',
      admin: { readOnly: true },
    },
        {
      name: 'useHtmlContent',
      type: 'checkbox',
      label: 'Use HTML Content',
      defaultValue: false,
      admin: {
        description: 'Admin only: use HTML content instead of rich text',
        condition: (data, siblingData, { user }: any) => user?.role === 'admin',
      },
    },
    {
      name: 'contentHtml',
      type: 'textarea',
      label: 'Content (HTML)',
      admin: {
        description: 'Admin only: direct HTML input',
        condition: (data, siblingData, { user }: any) => 
          user?.role === 'admin' &&
          siblingData?.useHtmlContent === true,
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HeadingFeature(),
          LinkFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [],
              },
            },
          }),
        ],
      }),
      admin: {
        condition: (_, siblingData) => siblingData?.useHtmlContent !== true,
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      label: 'Featured Image',
      relationTo: 'media',
    },
    {
      name: 'attachments',
      type: 'array',
      label: 'Attachments',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'viewCount',
      type: 'number',
      label: 'View Count',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'likeCount',
      type: 'number',
      label: 'Like Count',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: 'isNotice',
      type: 'checkbox',
      label: 'Pin as Notice',
      defaultValue: false,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'isSecret',
      type: 'checkbox',
      label: 'Secret Post',
      defaultValue: false,
    },
    // Q&A fields
    {
      name: 'isAnswered',
      type: 'checkbox',
      label: 'Answered',
      defaultValue: false,
      admin: {
        description: 'Mark this Q&A post as answered',
      },
    },
    {
      name: 'acceptedCommentId',
      type: 'number',
      label: 'Accepted Answer Comment ID',
      admin: {
        description: 'ID of the accepted answer comment',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'published',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Deleted', value: 'deleted' },
      ],
    },
    {
      name: 'anonymousAuthor',
      type: 'text',
      label: 'Anonymous Author Name',
      admin: {
        description: 'Display name for anonymous posts',
      },
    },
    {
      name: 'anonymousIp',
      type: 'text',
      label: 'Anonymous IP',
      admin: {
        readOnly: true,
        description: 'Stored for moderation only. Do not display publicly.',
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
        description: 'Stored for moderation only.',
      },
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'deletedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'restoredAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'restoredBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {

        if (operation === 'create' && req.user) {
          if (!data.author) {
            data.author = req.user.id;
          }
        }

        if (operation === 'update' && originalDoc?.isDeleted === true) {
          

          const isCustomRestoring = data.isDeleted === false || data.status === 'published';
          const isPayloadTrashRestoring = req.query?.trash === 'true' || req.query?.trash === true;

          if (isCustomRestoring || isPayloadTrashRestoring) {
            data.isDeleted = false;
            data.status = 'published'; 
            data.restoredAt = new Date().toISOString();
            data.restoredBy = req.user?.id || null;
          } else {
            throw new Error('Deleted posts cannot be edited. Please restore them first.');
          }
        }
        return data;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const mediaIds = new Set<number>()

        if (doc.thumbnail) {
          mediaIds.add(typeof doc.thumbnail === 'object' ? doc.thumbnail.id : doc.thumbnail)
        }

        if (Array.isArray(doc.attachments)) {
          for (const att of doc.attachments) {
            const file = att?.file
            if (file) {
              mediaIds.add(typeof file === 'object' ? file.id : file)
            }
          }
        }

        for (const mediaId of mediaIds) {
          try {
            await req.payload.delete({
              collection: 'media',
              id: mediaId,
              req,
            })
          } catch (err) {
            console.error(`Failed to delete media ${mediaId}`, err)
          }
        }
      },
    ],
  },
}
