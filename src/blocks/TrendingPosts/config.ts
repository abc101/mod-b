import type { Block } from 'payload'

export const TrendingPostsBlock: Block = {
  slug: 'trendingPosts',
  labels: {
    singular: 'Trending Posts',
    plural: 'Trending Posts',
  },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Trending Posts',
    },
    {
      name: 'postCount',
      type: 'number',
      label: 'Number of Posts',
      defaultValue: 10,
      min: 1,
      max: 50,
    },
    {
      name: 'periodDays',
      type: 'number',
      label: 'Period (days)',
      defaultValue: 7,
      min: 1,
      max: 365,
      admin: {
        description: 'Collect trending posts from the last N days based on view count.',
      },
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
      label: 'Show Ranking Numbers',
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