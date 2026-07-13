import type { CollectionConfig } from 'payload'

export const Boards: CollectionConfig = {
  slug: 'boards',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'boardType', 'isActive', 'managers', 'writeSettings.allowWrite', 'allowCommentWrite'],
    group: 'Board Management',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Board Name',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      required: true,
      unique: true,
      admin: {
        description: 'Example: free-board, gallery, notice (Spaces are allowed but not recommended. Please use hyphens instead.)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Board Description',
    },
    {
      name: 'boardType',
      type: 'select',
      label: 'Board Type',
      required: true,
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Card', value: 'card' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Compact', value: 'compact'},
        { label: 'Notice/Alert', value: 'notice' },
        { label: 'Q&A', value: 'qna' },
      ],
    },
    {
      name: 'listSettings',
      type: 'group',
      label: 'List Settings',
      fields: [
        {
          name: 'postsPerPage',
          type: 'number',
          label: 'Posts per Page',
          defaultValue: 20,
          min: 5,
          max: 100,
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
    },
    {
      name: 'announcementSettings',
      label: 'Announcement Settings',
      type: 'group',
      fields: [
        {
          name: 'enablePinnedNotices',
          label: 'Enable Pinned Notices',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'maxPinnedNotices',
          label: 'Maximum Pinned Notices',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 5,
          required: true,
          admin: {
            condition: (_, siblingData) =>
              siblingData?.enablePinnedNotices !== false,
          },
        },
      ],
    },
    {
      name: 'writeSettings',
      type: 'group',
      label: 'Write Settings',
      fields: [
        {
          name: 'allowWrite',
          type: 'select',
          label: 'Allow Write',
          defaultValue: 'member',
          options: [
            { label: 'Members only', value: 'member' },
            { label: 'Manager only', value: 'manager' },
            { label: 'Admins only', value: 'admin' },
          ],
        },
        {
          name: 'allowCommentWrite',
          type: 'select',
          label: 'Allow Comment Write',
          defaultValue: 'member',
          options: [
            { label: 'Members only', value: 'member' },
            { label: 'Managers only', value: 'manager' },
            { label: 'Admins only', value: 'admin' },
          ],
          admin: {
            description: 'Who can write comments. This only applies when Allow Comment is enabled.',
            condition: (_, siblingData) => siblingData?.allowComment !== false,
          },
        },
        {
          name: 'allowComment',
          type: 'checkbox',
          label: 'Allow Comment',
          defaultValue: true,
        },
        {
          name: 'allowAnonymous',
          type: 'checkbox',
          label: 'Allow Anonymous Writing',
          defaultValue: false,
        },
        {
          name: 'allowAnonymousComment',
          type: 'checkbox',
          label: 'Allow Anonymous Comments',
          defaultValue: false,
          admin: {
            condition: (_, siblingData) => siblingData?.allowComment !== false,
          },
        },
        {
          name: 'allowAttachment',
          type: 'checkbox',
          label: 'Allow File Attachments',
          defaultValue: true,
        },
        {
          name: 'maxAttachments',
          type: 'number',
          label: 'Max Attachment Count',
          defaultValue: 5,
          min: 0,
          max: 20,
        },

      ],
    },
    {
      name: 'skinSettings',
      type: 'group',
      label: 'Skin/Design Settings',
      fields: [
        {
          name: 'gridColumns',
          type: 'select',
          label: 'Grid Columns',
          defaultValue: '3',
          options: [
            { label: '1 Columns', value: '1' },
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
          admin: {
            condition: (data) =>
              ['card', 'gallery', 'compact'].includes(data?.boardType),
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        description: 'Smaller numbers are displayed first',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
    {
      name: 'managers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      label: 'Board Managers',
      admin: {
        description: 'Users who can manage this board.',
      },
      filterOptions: {
        role: {
          equals: 'manager',
        },
      },
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'managerEnabled',
      type: 'checkbox',
      label: 'Enable Board Managers',
      defaultValue: true,
      admin: {
        description: 'Disable this to temporarily prevent managers from managing this board.',
      },
      access: {
        create: ({ req }) => req.user?.role === 'admin',
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
