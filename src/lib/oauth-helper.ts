import { getPayload } from 'payload'
import configPromise from '@payload-config'

type SocialProvider = 'google' | 'naver' | 'kakao' | 'facebook'

export type SocialUserInfo = {
  email: string
  name?: string | null
  provider: SocialProvider
  providerAccountId: string
  socialAvatarUrl?: string | null
}

function generateSocialPassword(providerAccountId: string) {
  const secretSlice = process.env.AUTH_SECRET
    ? process.env.AUTH_SECRET.slice(0, 12)
    : 'fallback_secret'

  return `${providerAccountId}_${secretSlice}`
}

function sanitizeName(value: string | null | undefined, email: string) {
  const fallback = email.split('@')[0] || 'User'

  const clean = (value || fallback)
    .normalize('NFC')
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s+/g, ' ')
    .slice(0, 50)

  return clean || 'User'
}

function sanitizeNicknameBase(value: string) {
  return value
    .normalize('NFC')
    .replace(/\s+/g, '')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
}

function makeBaseNickname(
  name: string | null | undefined,
  email: string,
  providerAccountId: string,
) {
  const emailName = email.split('@')[0] || 'user'
  const rawBase = name || emailName || 'user'
  const cleanBase = sanitizeNicknameBase(rawBase)
  const safeBase = cleanBase.length >= 3 ? cleanBase : 'user'
  const suffix = providerAccountId.slice(-6)

  return `${safeBase}_${suffix}`
}

async function createUniqueNickname({
  payload,
  name,
  email,
  providerAccountId,
}: {
  payload: any
  name?: string | null
  email: string
  providerAccountId: string
}) {
  let nickname = makeBaseNickname(name, email, providerAccountId)

  const existing = await payload.find({
    collection: 'users',
    where: {
      nickname: { equals: nickname },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length === 0) {
    return nickname
  }

  return `${nickname}_${Date.now().toString().slice(-4)}`
}

export async function findSocialUser(info: SocialUserInfo) {
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: { equals: info.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length === 0) {
    throw new Error('social_account_not_found')
  }

  const user = existing.docs[0] as any

  if (user.isDeleted) {
    throw new Error('account_deleted')
  }

  if (user.isActive === false) {
    throw new Error('account_disabled')
  }

  if (!user.socialProvider || !user.socialProviderAccountId) {
    throw new Error('email_account_exists')
  }

  if (user.socialProvider !== info.provider) {
    throw new Error('different_social_provider')
  }

  return user
}

export async function createSocialUser(info: SocialUserInfo) {
  const payload = await getPayload({ config: configPromise })

  const existing = await payload.find({
    collection: 'users',
    where: {
      email: { equals: info.email },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    throw new Error('email_account_exists')
  }

  const displayName = sanitizeName(info.name, info.email)

  const nickname = await createUniqueNickname({
    payload,
    name: displayName,
    email: info.email,
    providerAccountId: info.providerAccountId,
  })

  const socialPassword = generateSocialPassword(info.providerAccountId)

  const newUser = await payload.create({
    collection: 'users',
    data: {
      email: info.email,
      name: displayName,
      nickname,
      role: 'member',
      isActive: true,
      emailVerified: true,
      termsAccepted: true,
      profileCompleted: true,
      socialProvider: info.provider,
      socialProviderAccountId: info.providerAccountId,
      socialAvatarUrl: info.socialAvatarUrl || undefined,
      password: socialPassword,
    },
    overrideAccess: true,
  })

  return newUser
}

export async function syncSocialUser(info: SocialUserInfo, user: any) {
  const payload = await getPayload({ config: configPromise })

  const displayName = sanitizeName(info.name, info.email)
  const socialPassword = generateSocialPassword(info.providerAccountId)

  const updateData: any = {
    socialProvider: info.provider,
    socialProviderAccountId: info.providerAccountId,
    password: socialPassword,
    isActive: true,
    emailVerified: true,
  }

  if (info.socialAvatarUrl && info.socialAvatarUrl !== user.socialAvatarUrl) {
    updateData.socialAvatarUrl = info.socialAvatarUrl
  }

  if (!user.name) {
    updateData.name = displayName
  }

  if (!user.nickname) {
    updateData.nickname = await createUniqueNickname({
      payload,
      name: displayName,
      email: info.email,
      providerAccountId: info.providerAccountId,
    })
  }

  return await payload.update({
    collection: 'users',
    id: user.id,
    data: updateData,
    overrideAccess: true,
  })
}

export async function getOrCreateSocialUserByMode(
  info: SocialUserInfo,
  mode: 'login' | 'register',
) {
  if (mode === 'register') {
    return await createSocialUser(info)
  }

  const user = await findSocialUser(info)
  return await syncSocialUser(info, user)
}

export async function createPayloadSession(
  email: string,
  providerAccountId: string,
): Promise<string | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const socialPassword = generateSocialPassword(providerAccountId)

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password: socialPassword,
      },
    })

    return result.token || null
  } catch (error) {
    console.error('❌ [createPayloadSession Local API Error]:', error)
    return null
  }
}