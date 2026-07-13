import type { CollectionConfig } from 'payload'

export const Advertisements: CollectionConfig = {
  slug: 'advertisements',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'adType', 'positions', 'isActive', 'startDate', 'endDate'],
    group: 'Advertisement Management',
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
      label: 'Advertisement Title (Admin Use)',
      required: true,
    },
    {
      name: 'adType',
      type: 'select',
      label: 'Advertisement Type',
      required: true,
      defaultValue: 'banner',
      options: [
        { label: 'Slide Banner', value: 'slide' },
        { label: 'Grid (2~4 columns)', value: 'grid' },
        { label: 'Single Banner', value: 'banner' },
        { label: 'Google AdSense', value: 'adsense' },
      ],
    },

    // ─── Common Settings ───────────────────────────────
    {
      name: 'image',
      type: 'upload',
      label: 'Advertisement Image',
      relationTo: 'media',
      admin: {
        condition: (data) => ['slide', 'grid', 'banner'].includes(data?.adType),
      },
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Click Link URL',
      admin: {
        condition: (data) => ['slide', 'grid', 'banner'].includes(data?.adType),
      },
    },
    {
      name: 'linkTarget',
      type: 'select',
      label: 'Link Opening Method',
      defaultValue: '_blank',
      options: [
        { label: 'New Tab', value: '_blank' },
        { label: 'Current Tab', value: '_self' },
      ],
      admin: {
        condition: (data) => ['slide', 'grid', 'banner'].includes(data?.adType),
      },
    },
    {
      name: 'altText',
      type: 'text',
      label: 'Image Alternative Text',
      admin: {
        condition: (data) => ['slide', 'grid', 'banner'].includes(data?.adType),
      },
    },

    // ─── Image Size/Layout Settings ────────────────────────
    {
      name: 'widthType',
      type: 'select',
      label: 'Horizontal Width Type',
      defaultValue: 'content',
      options: [
        { label: 'Full Width (Full Screen)', value: 'full' },
        { label: 'Content Width (Content Area)', value: 'content' },
        { label: 'Custom Input (px/%)', value: 'custom' },
      ],
      admin: {
        condition: (data) => ['slide', 'banner'].includes(data?.adType),
        description: 'Specifies the horizontal width of the advertisement image',
      },
    },
    {
      name: 'customWidth',
      type: 'text',
      label: 'Custom Width',
      admin: {
        condition: (data) => data?.widthType === 'custom',
        description: '예: 728px, 100%, 50vw',
      },
    },
    {
      name: 'customHeight',
      type: 'text',
      label: 'Custom Height',
      admin: {
        condition: (data) => ['slide', 'banner'].includes(data?.adType),
        description: '예: 90px, 250px, auto (비워두면 자동)',
      },
    },
    {
      name: 'objectFit',
      type: 'select',
      label: 'Image Fill Method',
      defaultValue: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Fill', value: 'fill' },
      ],
      admin: {
        condition: (data) => ['slide', 'banner'].includes(data?.adType),
      },
    },

    // ─── Slide Only Settings ──────────────────────────────────
    {
      name: 'slideGroup',
      type: 'text',
      label: 'Slide Group Name',
      admin: {
        condition: (data) => data?.adType === 'slide',
        description: 'Groups slides together into a single slider (e.g., hero-slider)',
      },
    },
    {
      name: 'slideOrder',
      type: 'number',
      label: 'Slide Order',
      defaultValue: 0,
      admin: {
        condition: (data) => data?.adType === 'slide',
      },
    },

    // ─── Grid Only Settings ────────────────────────────────────
    {
      name: 'gridGroup',
      type: 'text',
      label: 'Grid Group Name',
      admin: {
        condition: (data) => data?.adType === 'grid',
        description: 'Groups grid items together into a single grid (e.g., sidebar-grid)',
      },
    },
    {
      name: 'gridColumns',
      type: 'select',
      label: 'Grid Columns',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        condition: (data) => data?.adType === 'grid',
      },
    },
    {
      name: 'gridOrder',
      type: 'number',
      label: 'Grid Order',
      defaultValue: 0,
      admin: {
        condition: (data) => data?.adType === 'grid',
      },
    },

    // ─── Google Adsense Only Settings ──────────────────────────────────
    {
      name: 'adsenseCode',
      type: 'textarea',
      label: 'Adsense Code',
      admin: {
        condition: (data) => data?.adType === 'adsense',
        description: 'Paste the <ins> tag code issued from Google Adsense',
      },
    },

    // ─── Exposure Position Settings ──────────────────────────────────────
    {
      name: 'positions',
      type: 'select',
      label: 'Exposure Positions',
      required: true,
      defaultValue: ['board-top'],
      hasMany: true,
      options: [
        { label: 'Board List Top', value: 'board-top' },
        { label: 'Board List Middle', value: 'board-middle' },
        { label: 'Board List Bottom', value: 'board-bottom' },
        { label: 'Post Content Top', value: 'post-top' },
        { label: 'Post Content Bottom', value: 'post-bottom' },
        { label: 'Sidebar', value: 'sidebar' },
        { label: 'Home Page Only', value: 'home' },
      ],
    },
    {
      name: 'middlePosition',
      type: 'number',
      label: 'Middle Insertion Position (after Nth post)',
      defaultValue: 5,
      min: 1,
      admin: {
        condition: (data) => data?.positions?.includes('board-middle'),
        description: '5 → 5th post after',
      },
    },

    // ─── Exposure Target Settings ──────────────────────────────────────
    {
      name: 'targetBoards',
      type: 'relationship',
      label: 'Specific Boards Only',
      relationTo: 'boards',
      hasMany: true,
      admin: {
        description: 'Leave empty to display on all boards',
      },
    },

    // ─── Schedule Settings ────────────────────────────────────────
    {
      name: 'startDate',
      type: 'date',
      label: 'Exposure Start Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Exposure End Date',
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
      label: 'Exposure Priority',
      defaultValue: 0,
      admin: {
        description: 'The lower the number, the higher the priority',
      },
    },
  ],
}
