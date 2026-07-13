import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from './EditProfileForm'

export const dynamic = 'force-dynamic'

export default async function EditProfilePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login?redirect=/my-page/edit')

  // Fetch full user data
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
  }) as any

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>›</span>
        <Link href="/my-page" className="hover:text-gray-900">My Page</Link>
        <span>›</span>
        <span className="text-gray-900">Edit Profile</span>
      </nav>

      <EditProfileForm
        user={{
          id: fullUser.id,
          name: fullUser.name,
          nickname: fullUser.nickname,
          email: fullUser.email,
          bio: fullUser.bio,
          avatar: fullUser.avatar,
          socialAvatarUrl: fullUser.socialAvatarUrl,
        }}
      />
    </div>
  )
}
