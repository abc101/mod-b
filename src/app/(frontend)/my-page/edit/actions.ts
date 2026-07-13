'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const bio = formData.get('bio') as string
  const avatar = formData.get('avatar') as File | null

  if (!name?.trim()) throw new Error('Name is required.')

  let avatarId: number | undefined

  if (avatar && avatar.size > 0) {
    const arrayBuffer = await avatar.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploaded = await payload.create({
      collection: 'media',
      data: {
        alt: name.trim(),
      },
      file: {
        data: buffer,
        mimetype: avatar.type,
        name: avatar.name,
        size: avatar.size,
      },
      req: { headers } as any,
    })

    avatarId = uploaded.id
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      name: name.trim(),
      bio: bio?.trim() || undefined,
      ...(avatarId ? { avatar: avatarId } : {}),
    },
    req: { headers } as any,
  })

  revalidatePath('/my-page')
  redirect('/my-page')
}

export async function updatePassword(formData: FormData) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword) throw new Error('All fields are required.')
  if (newPassword !== confirmPassword) throw new Error('Passwords do not match.')
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters.')

  // Verify current password by attempting login
  const loginRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: currentPassword }),
  })

  if (!loginRes.ok) throw new Error('Current password is incorrect.')

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { password: newPassword },
    req: { headers } as any,
  })

  revalidatePath('/my-page')
  redirect('/my-page')
}

export async function deleteAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const deletedEmail = `deleted_user_${user.id}@deleted.local`

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      isActive: false,
      bio: null,
      avatar: null,
      socialAvatarUrl: null,
    },
    overrideAccess: true,
  })
}
