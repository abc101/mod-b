import type { Block } from 'payload'

export const BannerBlock: Block = {
  slug: 'bannerBlock',
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Banner Image',
    },
    {
      name: 'altText',
      type: 'text',
      label: 'Alt Text',
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link URL',
    },
    {
      name: 'linkTarget',
      type: 'select',
      label: 'Link Target',
      defaultValue: '_self',
      options: [
        { label: 'Same Tab', value: '_self' },
        { label: 'New Tab', value: '_blank' },
      ],
    },
    {
      name: 'widthType',
      type: 'select',
      label: 'Width',
      defaultValue: 'content',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Content Width', value: 'content' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'customWidth',
      type: 'text',
      label: 'Custom Width',
      admin: {
        condition: (data, siblingData) => siblingData?.widthType === 'custom',
        description: 'e.g. 728px, 50%',
      },
    },
    {
      name: 'customHeight',
      type: 'text',
      label: 'Custom Height',
      admin: {
        description: 'e.g. 90px, auto',
      },
    },
    {
      name: 'objectFit',
      type: 'select',
      label: 'Image Fit',
      defaultValue: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
      ],
    },
  ],
}
