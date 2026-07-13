import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSocialUserByMode, createPayloadSession } from '@/lib/oauth-helper'
import { createLoginLog } from '@/lib/login-log'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  let redirect = '/'
  let mode: 'login' | 'register' = 'login'

  if (state) {
    try {
      const parsed = JSON.parse(decodeURIComponent(state))
      redirect = parsed.redirect || '/'
      mode = parsed.mode === 'register' ? 'register' : 'login'
    } catch {
      redirect = '/'
      mode = 'login'
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl))
  }

  try {
    if (mode === 'register') {
      const accepted = req.cookies.get('registration_terms_accepted')?.value
      if (accepted !== 'true') {
        return NextResponse.redirect(new URL('/register/terms?error=terms_required', baseUrl))
      }
    }

    const tokenRes = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_FACEBOOK_ID!,
        client_secret: process.env.AUTH_FACEBOOK_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/callback/facebook`,
      }),
    })

    if (!tokenRes.ok) {
      console.error('❌ Facebook token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(new URL('/login?error=token_failed', baseUrl))
    }

    const { access_token } = await tokenRes.json()

    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture&access_token=${access_token}`,
    )

    if (!userRes.ok) {
      console.error('❌ Facebook userinfo failed:', await userRes.text())
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', baseUrl))
    }

    const profile = await userRes.json()

    const id = profile.id
    const email = profile.email
    const name = profile.name
    const picture = profile.picture?.data?.url || null

    if (!id || !email) {
      return NextResponse.redirect(new URL('/login?error=no_email', baseUrl))
    }

    const user = await getOrCreateSocialUserByMode(
      {
        email,
        name,
        provider: 'facebook',
        providerAccountId: id,
        socialAvatarUrl: picture,
      },
      mode,
    )

    const token = await createPayloadSession(user.email, user.socialProviderAccountId || id)

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=session_failed', baseUrl))
    }

    try {
      const payload = await getPayload({ config: configPromise })
      await createLoginLog({
        payload,
        user,
        req,
        eventType: 'login',
        loginMethod: 'facebook',
        success: true,
        message: mode === 'register' ? 'Facebook registration successful' : 'Facebook login successful',
      })
    } catch (logError: any) {
      console.error('Failed to create Facebook login log:', logError?.message)
    }

    const response = NextResponse.redirect(new URL(redirect || '/', baseUrl))

    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || baseUrl.startsWith('https'),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    if (mode === 'register') {
      response.cookies.set('registration_terms_accepted', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || baseUrl.startsWith('https'),
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      })
    }

    return response
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'account_deleted') return NextResponse.redirect(new URL('/login?error=account_deleted', baseUrl))
      if (error.message === 'account_disabled') return NextResponse.redirect(new URL('/login?error=account_disabled', baseUrl))
      if (error.message === 'email_account_exists') return NextResponse.redirect(new URL('/login?error=email_account_exists', baseUrl))
      if (error.message === 'different_social_provider') return NextResponse.redirect(new URL('/login?error=different_social_provider', baseUrl))
      if (error.message === 'social_account_not_found') {
        return NextResponse.redirect(new URL('/register/terms?error=social_account_not_found', baseUrl))
      }
    }

    console.error('Facebook callback error:', error)
    return NextResponse.redirect(new URL('/login?error=facebook_callback_failed', baseUrl))
  }
}