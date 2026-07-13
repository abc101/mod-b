import type { Block } from 'payload'

export const BoardGridBlock: Block = {
  slug: 'boardGrid',
  labels: {
    singular: 'Board Grid',
    plural: 'Board Grids',
  },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
    },
    {
      name: 'boards',
      type: 'array',
      label: 'Boards',
      admin: {
        components: {
          RowLabel: '@/components/admin/BoardGridRowLabel#default',
        },
      },
      minRows: 1,
      maxRows: 6,
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
          label: 'Number of Posts to Show',
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
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '2',
      options: [
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'showMoreLink',
      type: 'checkbox',
      label: 'Show "More" Link',
      defaultValue: true,
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
  ],
}
