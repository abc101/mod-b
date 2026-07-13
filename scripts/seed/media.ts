import path from 'node:path'

import type { Media } from '@/payload-types'
import type { SeedContext } from './utils'
import { findOne, logStep } from './utils'

export type SeedMedia = {
  hero: Media[]
  thumbs: Media[]
  ads: Media[]
}

type SeedAsset = {
  filename: string
  alt: string
}

const FIXTURE_DIR = path.join(
  process.cwd(),
  'src',
  'seed',
  'fixtures',
)

async function createRasterMedia(
  { payload }: SeedContext,
  asset: SeedAsset,
): Promise<Media> {
  const existing = await findOne<Media>({
    payload,
    collection: 'media',
    where: {
      alt: {
        equals: asset.alt,
      },
    },
  })

  if (existing) return existing

  const filePath = path.join(
    FIXTURE_DIR,
    asset.filename,
  )

  return (await payload.create({
    collection: 'media',
    data: {
      alt: asset.alt,
    },
    filePath,
    overrideAccess: true,
  })) as Media
}

async function createMediaGroup(
  ctx: SeedContext,
  assets: SeedAsset[],
): Promise<Media[]> {
  return Promise.all(
    assets.map((asset) =>
      createRasterMedia(ctx, asset),
    ),
  )
}

export async function seedMedia(
  ctx: SeedContext,
): Promise<SeedMedia> {
  logStep('Seeding raster media')

  const hero = await createMediaGroup(ctx, [
    {
      filename: 'mod-b-seed-hero-community.webp',
      alt: 'Mod-B Seed Hero Community',
    },
    {
      filename: 'mod-b-seed-hero-hawaii.webp',
      alt: 'Mod-B Seed Hero Hawaii',
    },
    {
      filename: 'mod-b-seed-hero-platform.webp',
      alt: 'Mod-B Seed Hero Platform',
    },
  ])

  const thumbs = await createMediaGroup(ctx, [
    {
      filename: 'mod-b-seed-thumb-01.webp',
      alt: 'Mod-B Seed Thumbnail 01',
    },
    {
      filename: 'mod-b-seed-thumb-02.jpg',
      alt: 'Mod-B Seed Thumbnail 02',
    },
    {
      filename: 'mod-b-seed-thumb-03.png',
      alt: 'Mod-B Seed Thumbnail 03',
    },
    {
      filename: 'mod-b-seed-thumb-04.webp',
      alt: 'Mod-B Seed Thumbnail 04',
    },
    {
      filename: 'mod-b-seed-thumb-05.jpg',
      alt: 'Mod-B Seed Thumbnail 05',
    },
    {
      filename: 'mod-b-seed-thumb-06.png',
      alt: 'Mod-B Seed Thumbnail 06',
    },
    {
      filename: 'mod-b-seed-thumb-07.webp',
      alt: 'Mod-B Seed Thumbnail 07',
    },
    {
      filename: 'mod-b-seed-thumb-08.jpg',
      alt: 'Mod-B Seed Thumbnail 08',
    },
  ])

  const ads = await createMediaGroup(ctx, [
    {
      filename: 'mod-b-seed-ad-banner.webp',
      alt: 'Mod-B Seed Ad Banner',
    },
    {
      filename: 'mod-b-seed-ad-grid.png',
      alt: 'Mod-B Seed Ad Grid',
    },
    {
      filename: 'mod-b-seed-ad-slide.jpg',
      alt: 'Mod-B Seed Ad Slide',
    },
  ])

  return {
    hero,
    thumbs,
    ads,
  }
}
