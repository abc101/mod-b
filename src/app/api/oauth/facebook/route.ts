import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const redirect = req.nextUrl.searchParams.get('redirect') || '/'
  const mode = req.nextUrl.searchParams.get('mode') || 'login'

  const params = new URLSearchParams({
    client_id: process.env.AUTH_FACEBOOK_ID!,
    redirect_uri: `${baseUrl}/api/auth/callback/facebook`,
    response_type: 'code',
    scope: 'email,public_profile',
    access_type: 'online',
    state: encodeURIComponent(
      JSON.stringify({
        redirect,
        mode,
      }),
    ),
  })

  return NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
  )
}