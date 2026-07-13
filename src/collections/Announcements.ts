import type { CollectionConfig } from 'payload'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'message', 'isActive', 'startDate', 'endDate', 'order', 'createdAt'],
    group: 'Site Management',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Announcement Title',
      required: true,
    },
    {
      name: 'message',
      type: 'text',
      label: 'Short Message',
    },
    {
      name: 'linkType',
      type: 'select',
      label: 'Link Type',
      defaultValue: 'custom',
      options: [
        { label: 'No Link', value: 'none' },
        { label: 'Custom URL', value: 'custom' },
        { label: 'Page', value: 'page' },
        { label: 'Board', value: 'board' },
      ],
    },
    {
      name: 'customUrl',
      type: 'text',
      label: 'Custom URL',
      admin: {
        condition: (_, siblingData) => siblingData?.linkType === 'custom',
      },
    },
    {
      name: 'pageLink',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Page',
      admin: {
        condition: (_, siblingData) => siblingData?.linkType === 'page',
      },
    },
    {
      name: 'boardLink',
      type: 'relationship',
      relationTo: 'boards',
      label: 'Board',
      admin: {
        condition: (_, siblingData) => siblingData?.linkType === 'board',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Display Type',
      defaultValue: 'ticker',
      options: [
        { label: 'Ticker', value: 'ticker' },
        { label: 'Bar', value: 'bar' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
    },
  ],
}