import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({
    headers: req.headers,
  })

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const secret = payload.secret

  if (!secret) {
    return NextResponse.json({ error: 'missing_secret' }, { status: 500 })
  }

  const tokenExpiration = 60 * 60 * 24 * 7 // 7 days

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      collection: 'users',
    },
    secret,
    {
      expiresIn: tokenExpiration,
    },
  )

  const response = NextResponse.json({ success: true })

  response.cookies.set('payload-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokenExpiration,
  })

  return response
}