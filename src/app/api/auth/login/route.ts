import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: NextRequest) {
  try {

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'auth_failed' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    const users = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'user_not_found' },
        { status: 404 },
      )
    }

    const user = users.docs[0] as any

    if (user.isDeleted) {
      return NextResponse.json(
        { error: 'account_deleted' },
        { status: 403 },
      )
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'account_disabled' },
        { status: 403 },
      )
    }

    if (user.socialProvider && user.socialProviderAccountId) {
      return NextResponse.json(
        {
          error: 'social_login_only',
          provider: user.socialProvider,
        },
        { status: 403 },
      )
    }

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (!result?.token) {
      return NextResponse.json(
        { error: 'auth_failed' },
        { status: 401 },
      )
    }

    const response = NextResponse.json({
      token: result.token,
      user,
      needsProfileCompletion: user.profileCompleted !== true,
    })

    response.cookies.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    console.error('❌ Custom login route error:', err)

    return NextResponse.json(
      { error: 'auth_failed' },
      { status: 401 },
    )
  }
}