import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const redirect = req.nextUrl.searchParams.get('redirect') || '/'
  const mode = req.nextUrl.searchParams.get('mode') || 'login'

  const params = new URLSearchParams({
    client_id: process.env.AUTH_NAVER_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/naver`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    state: encodeURIComponent(
      JSON.stringify({
        redirect,
        mode,
      }),
    ),
  })

  return NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
  )
}