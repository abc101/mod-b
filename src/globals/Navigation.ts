import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Menu Items',
      admin: {
        description: 'Add and reorder menu items. Drag to reorder.',
        components: {
          RowLabel: '@/components/admin/NavigationItemRowLabel#default',
        },
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Menu Label',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          label: 'Type',
          required: true,
          defaultValue: 'board',
          options: [
            { label: 'Board Link', value: 'board' },
            { label: 'Dropdown Category', value: 'dropdown' },
            { label: 'Custom URL', value: 'url' },
            { label: 'Page', value: 'page' },
          ],
        },
        // Board link
        {
          name: 'board',
          type: 'relationship',
          label: 'Board',
          relationTo: 'boards',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'board',
          },
        },
        // Custom URL
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'url',
            description: 'e.g. /about or https://example.com',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in new tab',
          defaultValue: false,
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'url',
          },
        },
        // Page link
        {
          name: 'page',
          type: 'relationship',
          label: 'Page',
          relationTo: 'pages',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'page',
          },
        },
        // Dropdown title link
        {
          name: 'dropdownLinkType',
          type: 'select',
          label: 'Dropdown Title Link Type',
          defaultValue: 'none',
          options: [
            { label: 'No Link', value: 'none' },
            { label: 'Page', value: 'page' },
            { label: 'Custom URL', value: 'url' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'dropdown',
            description: 'Optional link for the dropdown title itself.',
          },
        },
        {
          name: 'dropdownPage',
          type: 'relationship',
          label: 'Dropdown Title Page',
          relationTo: 'pages',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === 'dropdown' &&
              siblingData?.dropdownLinkType === 'page',
          },
        },
        {
          name: 'dropdownUrl',
          type: 'text',
          label: 'Dropdown Title URL',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === 'dropdown' &&
              siblingData?.dropdownLinkType === 'url',
            description: 'e.g. /it or https://example.com',
          },
        },
        {
          name: 'dropdownOpenInNewTab',
          type: 'checkbox',
          label: 'Open dropdown title in new tab',
          defaultValue: false,
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type === 'dropdown' &&
              siblingData?.dropdownLinkType === 'url',
          },
        },
        // Dropdown children
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown Items',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'dropdown',
            description: 'Sub-menu items shown in dropdown',
            components: {
              RowLabel: '@/components/admin/NavigationChildRowLabel#default',
            },
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              label: 'Type',
              defaultValue: 'board',
              options: [
                { label: 'Board Link', value: 'board' },
                { label: 'Custom URL', value: 'url' },
                { label: 'Page', value: 'page' },
              ],
            },
            {
              name: 'board',
              type: 'relationship',
              label: 'Board',
              relationTo: 'boards',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'board',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'url',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              label: 'Open in new tab',
              defaultValue: false,
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'url',
              },
            },
            {
              name: 'page',
              type: 'relationship',
              label: 'Page',
              relationTo: 'pages',
              admin: {
                condition: (data, siblingData) => siblingData?.type === 'page',
              },
            },
          ],
        },
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active',
          defaultValue: true,
        },
      ],
    },

    // ─── Footer ──────────────────────────────────────────────────
    {
      name: 'footer',
      type: 'group',
      label: 'Footer',
      fields: [
        // Grid columns setting
        {
          name: 'columns',
          type: 'select',
          label: 'Menu Grid Columns',
          defaultValue: '3',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        // Column items
        {
          name: 'columnItems',
          type: 'array',
          label: 'Footer Columns',
          admin: {
            description: 'Add columns to the footer. Number of columns is set above.',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Column Title',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Links',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  label: 'Type',
                  defaultValue: 'page',
                  options: [
                    { label: 'Page', value: 'page' },
                    { label: 'Board', value: 'board' },
                    { label: 'Custom URL', value: 'url' },
                  ],
                },
                {
                  name: 'page',
                  type: 'relationship',
                  label: 'Page',
                  relationTo: 'pages',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'page',
                  },
                },
                {
                  name: 'board',
                  type: 'relationship',
                  label: 'Board',
                  relationTo: 'boards',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'board',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'URL',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'url',
                    description: 'e.g. /about or https://example.com',
                  },
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  label: 'Open in new tab',
                  defaultValue: false,
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'url',
                  },
                },
              ],
            },
          ],
        },
        // Bottom bar
        {
          name: 'bottomBar',
          type: 'group',
          label: 'Bottom Bar',
          fields: [
            {
              name: 'copyrightName',
              type: 'text',
              label: 'Copyright Name',
            },
            {
              name: 'showYear',
              type: 'checkbox',
              label: 'Show Current Year',
              defaultValue: true,
            },
            {
              name: 'bottomLinks',
              type: 'array',
              label: 'Bottom Links',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'page',
                  options: [
                    { label: 'Page', value: 'page' },
                    { label: 'Board', value: 'board' },
                    { label: 'Custom URL', value: 'url' },
                    { label: 'Email', value: 'email' },
                  ],
                },
                {
                  name: 'page',
                  type: 'relationship',
                  relationTo: 'pages',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'page',
                  },
                },
                {
                  name: 'board',
                  type: 'relationship',
                  relationTo: 'boards',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'board',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'url',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  admin: {
                    condition: (data, siblingData) => siblingData?.type === 'email',
                  },
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'rightText',
              type: 'text',
              label: 'Right Text',
            },
          ],
        }
      ],
    },
  ],
}
