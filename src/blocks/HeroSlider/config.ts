import type { Block } from 'payload'

export const HeroSliderBlock: Block = {
  slug: 'heroSlider',
  labels: {
    singular: 'Hero Slider',
    plural: 'Hero Sliders',
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      admin: {
        components: {
          RowLabel: '@/components/admin/HeroSlideRowLabel#default',
        },
      },
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
        },
        {
          name: 'subtitle',
          type: 'text',
          label: 'Subtitle',
        },
        {
          name: 'linkUrl',
          type: 'text',
          label: 'Link URL',
        },
        {
          name: 'linkLabel',
          type: 'text',
          label: 'Link Button Label',
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
      ],
    },
    {
      name: 'heightType',
      type: 'select',
      label: 'Slider Height',
      defaultValue: 'medium',
      options: [
        { label: 'Small (300px)', value: 'small' },
        { label: 'Medium (500px)', value: 'medium' },
        { label: 'Large (700px)', value: 'large' },
        { label: 'Full Screen', value: 'full' },
        { label: 'Custom', value: 'custom' },
      ],
    },
    {
      name: 'customHeight',
      type: 'text',
      label: 'Custom Height',
      admin: {
        condition: (data, siblingData) => siblingData?.heightType === 'custom',
        description: 'e.g. 400px, 60vh',
      },
    },
    {
      name: 'autoPlay',
      type: 'checkbox',
      label: 'Auto Play',
      defaultValue: true,
    },
    {
      name: 'autoPlayInterval',
      type: 'number',
      label: 'Auto Play Interval (ms)',
      defaultValue: 4000,
      admin: {
        condition: (data, siblingData) => siblingData?.autoPlay,
      },
    },
    {
      name: 'showDots',
      type: 'checkbox',
      label: 'Show Dots',
      defaultValue: true,
    },
    {
      name: 'showArrows',
      type: 'checkbox',
      label: 'Show Arrows',
      defaultValue: true,
    },
  ],
}
