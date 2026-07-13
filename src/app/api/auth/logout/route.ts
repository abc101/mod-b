import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

function getRequestInfo(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const userAgent = req.headers.get('user-agent') || ''

  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    'unknown'

  return { ipAddress, userAgent }
}

export async function GET(req: NextRequest) {
  const redirectTo = req.nextUrl.searchParams.get('redirect') || '/login'
  const response = NextResponse.redirect(new URL(redirectTo, req.url))

  response.cookies.set('payload-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })

  try {
    const { user } = await payload.auth({ headers: req.headers })

    if (user) {
      const { ipAddress, userAgent } = getRequestInfo(req)

      await payload.create({
        collection: 'login-logs',
        data: {
          eventType: 'logout',
          user: user.id,
          email: user.email,
          ipAddress,
          userAgent,
          loginMethod: (user as any).socialProvider || 'password',
        },
        overrideAccess: true,
      })
    }
  } catch (err: any) {
    console.error('Failed to create logout log:', err?.message)
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set('payload-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}