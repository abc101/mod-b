import type { Block } from 'payload'

export const AdvertisementBlock: Block = {
  slug: 'advertisementBlock',
  labels: {
    singular: 'Advertisement',
    plural: 'Advertisements',
  },
  fields: [
    {
      name: 'adType',
      type: 'select',
      label: 'Ad Type',
      required: true,
      defaultValue: 'single',
      options: [
        { label: 'Single Banner', value: 'single' },
        { label: 'Slide Banner', value: 'slide' },
        { label: 'Grid (2~4 columns)', value: 'grid' },
        { label: 'Google AdSense', value: 'adsense' },
      ],
    },
    // Single / Slide: pick from Advertisements collection
    {
      name: 'slideGroup',
      type: 'text',
      label: 'Slide Group Name',
      admin: {
        condition: (data, siblingData) => siblingData?.adType === 'slide',
        description: 'Renders all active ads with matching slide group name',
      },
    },
    {
      name: 'gridGroup',
      type: 'text',
      label: 'Grid Group Name',
      admin: {
        condition: (data, siblingData) => siblingData?.adType === 'grid',
        description: 'Renders all active ads with matching grid group name',
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
        condition: (data, siblingData) => siblingData?.adType === 'grid',
      },
    },
    {
      name: 'singleAd',
      type: 'relationship',
      label: 'Select Advertisement',
      relationTo: 'advertisements',
      admin: {
        condition: (data, siblingData) => siblingData?.adType === 'single',
      },
    },
    {
      name: 'adsenseSlot',
      type: 'text',
      label: 'AdSense Ad Slot ID',
      admin: {
        condition: (data, siblingData) => siblingData?.adType === 'adsense',
        description: 'e.g. 1234567890',
      },
    },
    {
      name: 'widthType',
      type: 'select',
      label: 'Width',
      defaultValue: 'content',
      options: [
        { label: 'Full Width', value: 'full' },
        { label: 'Content Width', value: 'content' },
      ],
    },
  ],
}
