import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import RenderBlocks from '@/components/RenderBlocks'
import type { Metadata } from 'next'
import { getMetadataBase } from '@/lib/siteUrl'

type Props = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)
  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    where: { slug: { equals: decodedSlug } },
    limit: 1,
  })

  const page = pages.docs[0] as any
  if (!page) return {}

  return {
    metadataBase: getMetadataBase(),
    title: page.meta?.title || page.title,
    description: page.meta?.description,
    openGraph: page.meta?.image?.url
      ? { images: [{ url: page.meta.image.url }] }
      : undefined,
  }
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const encodedSlug = encodeURIComponent(decodedSlug)
  const payload = await getPayload({ config: configPromise })

  const pages = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { slug: { equals: decodedSlug } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 3,
  })

  const page = pages.docs[0]
  if (!page) notFound()

  return <RenderBlocks blocks={(page as any).layout || []} />
}
