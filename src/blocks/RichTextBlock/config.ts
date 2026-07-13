import type { Block } from 'payload'
import {
  lexicalEditor,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HeadingFeature,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const RichTextBlock: Block = {
  slug: 'richTextBlock',
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text Blocks',
  },
  fields: [
    {
      name: 'useHtmlContent',
      type: 'checkbox',
      label: 'Use HTML Content',
      defaultValue: false,
      admin: {
        description: 'Admin only. Use raw HTML instead of the rich text editor.',
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
      name: 'widthType',
      type: 'select',
      label: 'Width',
      defaultValue: 'content',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Content Width', value: 'content' },
        { label: 'Narrow', value: 'narrow' },
      ],
    },
    {
      name: 'alignment',
      type: 'select',
      label: 'Text Alignment',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}