import { getPayload } from 'payload'
import configPromise from '@payload-config'
import TermsAgreementForm from './TermsAgreementForm'

type Props = {
  searchParams: Promise<{
    error?: string
  }>
}

export default async function RegisterTermsPage({ searchParams }: Props) {
  const params = await searchParams
  const urlError = params.error || null

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { slug: { equals: 'terms-of-service' } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  const page = result.docs[0] as any

  const richTextBlock = page?.layout?.find(
    (block: any) => block.blockType === 'richTextBlock',
  )

  const termsPage = page
    ? {
        title: page.title,
        content: richTextBlock?.content || null,
        contentHtml: richTextBlock?.contentHtml || null,
      }
    : null

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <TermsAgreementForm
        urlError={urlError}
        termsPage={termsPage}
        socialSettings={{
          google: { enabled: true },
          naver: { enabled: true },
          kakao: { enabled: true },
          facebook: { enabled: true },
        }}
      />
    </div>
  )
}