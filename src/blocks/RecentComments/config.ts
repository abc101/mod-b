import type { Block } from 'payload'

export const RecentCommentsBlock: Block = {
  slug: 'recentComments',
  labels: {
    singular: 'Recent Comments',
    plural: 'Recent Comments',
  },
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Recent Comments',
    },
    {
      name: 'commentCount',
      type: 'number',
      label: 'Number of Comments',
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
      name: 'showBoardName',
      type: 'checkbox',
      label: 'Show Board Name',
      defaultValue: true,
    },
    {
      name: 'showAuthor',
      type: 'checkbox',
      label: 'Show Author',
      defaultValue: true,
    },
    {
      name: 'showDate',
      type: 'checkbox',
      label: 'Show Date',
      defaultValue: true,
    },
  ],
}