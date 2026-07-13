import type { CollectionConfig } from 'payload'
import { HeroSliderBlock } from '../blocks/HeroSlider/config'
import { BoardGridBlock } from '../blocks/BoardGrid/config'
import { LatestPostsBlock } from '../blocks/LatestPosts/config'
import { TrendingPostsBlock } from '../blocks/TrendingPosts/config'
import { SingleBoardBlock } from '../blocks/SingleBoard/config'
import { AdvertisementBlock } from '../blocks/AdvertisementBlock/config'
import { RichTextBlock } from '../blocks/RichTextBlock/config'
import { BannerBlock } from '../blocks/BannerBlock/config'
import { PopularPostsBlock } from '@/blocks/PopularPosts/config'
import { RecentCommentsBlock } from '@/blocks/RecentComments/config'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Content',
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/${doc.slug === 'home' ? '' : doc.slug}`
      }
      return null
    },
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
      label: 'Page Title',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        description: 'Use "home" for the homepage. e.g. home, about, event',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page Layout',
      blocks: [
        HeroSliderBlock,
        BoardGridBlock,
        LatestPostsBlock,
        TrendingPostsBlock,
        PopularPostsBlock,
        SingleBoardBlock,
        AdvertisementBlock,
        RichTextBlock,
        BannerBlock,
        RecentCommentsBlock,
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'published',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    // SEO
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'OG Image',
          relationTo: 'media',
        },
      ],
    },
  ],
}
