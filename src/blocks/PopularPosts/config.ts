import type { Block } from 'payload'

export const PopularPostsBlock: Block = {
  slug: 'popularPosts',
  labels: {
    singular: 'Popular Posts',
    plural: 'Popular Posts',
  },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Popular Posts',
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
      name: 'filterBoards',
      type: 'relationship',
      label: 'Filter by Boards (empty = all boards)',
      relationTo: 'boards',
      hasMany: true,
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
        { label: '1 Column', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        condition: (_, siblingData) =>
          ['card', 'gallery', 'compact'].includes(siblingData?.displayType),
      },
    },
    {
      name: 'showRanking',
      type: 'checkbox',
      label: 'Show Ranking Number',
      defaultValue: true,
    },
    {
      name: 'showBoardName',
      type: 'checkbox',
      label: 'Show Board Name',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.displayType !== 'compact',
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