import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const redirect = req.nextUrl.searchParams.get('redirect') || '/'
  const mode = req.nextUrl.searchParams.get('mode') || 'login'

  const params = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!,
    redirect_uri: `${baseUrl}/api/auth/callback/google`,
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
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  )
}