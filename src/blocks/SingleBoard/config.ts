import type { Block } from 'payload'

export const SingleBoardBlock: Block = {
  slug: 'singleBoard',
  labels: {
    singular: 'Single Board',
    plural: 'Single Boards',
  },
  fields: [
    {
      name: 'board',
      type: 'relationship',
      relationTo: 'boards',
      required: true,
      label: 'Board',
    },
    {
      name: 'customTitle',
      type: 'text',
      label: 'Custom Title (overrides board name)',
    },
    {
      name: 'postCount',
      type: 'number',
      label: 'Number of Posts',
      defaultValue: 5,
      min: 1,
      max: 20,
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Display Type',
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Card', value: 'card' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Compact', value: 'compact' },
      ],
    },
    {
      name: 'gridColumns',
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '3',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
      admin: {
        condition: (_, siblingData) =>
          ['card', 'gallery', 'compact'].includes(
            siblingData?.displayType,
          ),
      },
    },
    {
      name: 'showAuthor',
      type: 'checkbox',
      label: 'Show Author',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayType !== 'compact',
      },
    },
    {
      name: 'showDate',
      type: 'checkbox',
      label: 'Show Date',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayType !== 'compact',
      },
    },
    {
      name: 'showViewCount',
      type: 'checkbox',
      label: 'Show View Count',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayType !== 'compact',
      },
    },
    {
      name: 'showMoreLink',
      type: 'checkbox',
      label: 'Show "More" Link',
      defaultValue: true,
    },
  ],
}
