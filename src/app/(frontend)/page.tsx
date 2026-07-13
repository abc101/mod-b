import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RenderBlocks from '@/components/RenderBlocks'
import { getPage } from '@/lib/services/pages'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const page = await getPage({
      payload,
      slug: 'home',
  })

  if (!page) {
    // No home page created yet — show a setup message
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-500 mb-6">
          Go to the admin panel and create a page with the slug <code className="bg-gray-100 px-2 py-0.5 rounded">home</code> to get started.
        </p>
        <a
          href="/admin"
          className="bg-gray-900 text-white px-6 py-2.5 rounded hover:bg-gray-700 transition-colors"
        >
          Go to Admin
        </a>
      </div>
    )
  }

  return <RenderBlocks blocks={(page as any).layout || []} />
}
