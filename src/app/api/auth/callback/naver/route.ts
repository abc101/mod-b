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
        return NextResponse.redirect(
          new URL('/register/terms?error=terms_required', baseUrl),
        )
      }
    }

    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_NAVER_ID!,
        client_secret: process.env.AUTH_NAVER_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/callback/naver`,
        grant_type: 'authorization_code',
        state: state || '',
      }),
    })

    if (!tokenRes.ok) {
      console.error('❌ Naver token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(new URL('/login?error=token_failed', baseUrl))
    }

    const { access_token } = await tokenRes.json()

    const userRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userRes.ok) {
      console.error('❌ Naver userinfo failed:', await userRes.text())
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', baseUrl))
    }

    const data = await userRes.json()

    const id = data.response?.id
    const email = data.response?.email
    const name = data.response?.name
    const picture = data.response?.profile_image || null

    if (!id || !email) {
      return NextResponse.redirect(new URL('/login?error=no_email', baseUrl))
    }

    const user = await getOrCreateSocialUserByMode(
      {
        email,
        name: name || email.split('@')[0],
        provider: 'naver',
        providerAccountId: id,
        socialAvatarUrl: picture,
      },
      mode,
    )

    const token = await createPayloadSession(
      user.email,
      user.socialProviderAccountId || id,
    )

    if (!token) {
      console.error('❌ [OAuth Error] Payload session token generation failed for:', user.email)
      return NextResponse.redirect(new URL('/login?error=session_failed', baseUrl))
    }

    try {
      const payload = await getPayload({ config: configPromise })

      await createLoginLog({
        payload,
        user,
        req,
        eventType: 'login',
        loginMethod: 'naver',
        success: true,
        message:
          mode === 'register'
            ? 'Naver registration successful'
            : 'Naver login successful',
      })
    } catch (logError: any) {
      console.error('Failed to create Naver login log:', logError?.message)
    }

    const nextPath = redirect || '/'
    const response = NextResponse.redirect(new URL(nextPath, baseUrl))

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
    if (error instanceof Error && error.message === 'account_deleted') {
      return NextResponse.redirect(new URL('/login?error=account_deleted', baseUrl))
    }

    if (error instanceof Error && error.message === 'account_disabled') {
      return NextResponse.redirect(new URL('/login?error=account_disabled', baseUrl))
    }

    if (error instanceof Error && error.message === 'email_account_exists') {
      return NextResponse.redirect(new URL('/login?error=email_account_exists', baseUrl))
    }

    if (error instanceof Error && error.message === 'different_social_provider') {
      return NextResponse.redirect(new URL('/login?error=different_social_provider', baseUrl))
    }

    if (error instanceof Error && error.message === 'social_account_not_found') {
      return NextResponse.redirect(
        new URL('/register/terms?error=social_account_not_found', baseUrl),
      )
    }

    console.error('Naver callback error:', error)

    return NextResponse.redirect(
      new URL('/login?error=naver_callback_failed', baseUrl),
    )
  }
}