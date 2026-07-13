import type { GlobalConfig } from 'payload'

export const DateTimeSettings: GlobalConfig = {
  slug: 'date-time-settings',
  label: 'Date / Time',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enable Date / Time Ticker',
      defaultValue: false,
    },
    {
      name: 'displayMode',
      type: 'select',
      label: 'Display Mode',
      defaultValue: 'rolling',
      options: [
        { label: 'Rolling', value: 'rolling' },
        { label: 'Inline', value: 'inline' },
      ],
    },
    {
      name: 'showWeather',
      type: 'checkbox',
      label: 'Show Weather',
      defaultValue: true,
    },
    {
      name: 'showDateTime',
      type: 'checkbox',
      label: 'Show Date / Time',
      defaultValue: true,
    },
    {
      name: 'locations',
      type: 'array',
      label: 'Locations',
      minRows: 1,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon / Emoji',
          defaultValue: '📍',
        },
        {
          name: 'timeZone',
          type: 'text',
          label: 'IANA Time Zone',
          defaultValue: 'Pacific/Honolulu',
          required: true,
          admin: {
            description: 'Example: Pacific/Honolulu, Asia/Seoul, America/New_York',
          },
        },
        {
          name: 'latitude',
          type: 'number',
          label: 'Latitude',
          required: true,
        },
        {
          name: 'longitude',
          type: 'number',
          label: 'Longitude',
          required: true,
        },
      ],
    },
  ],
}