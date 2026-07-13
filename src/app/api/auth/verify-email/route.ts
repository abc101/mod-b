import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/**
 * GET 요청에서는 계정을 인증하지 않습니다.
 * 이메일 보안 스캐너가 링크를 미리 방문해도 토큰이 소비되지 않습니다.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const baseUrl = getBaseUrl()

  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_token', baseUrl),
    )
  }

  const safeToken = escapeHtml(token)

  return new NextResponse(
    `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />
          <title>Verify Email</title>
        </head>

        <body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;">
          <main
            style="
              max-width:520px;
              margin:80px auto;
              padding:32px;
              background:#fff;
              border-radius:12px;
              box-shadow:0 4px 20px rgba(0,0,0,.08);
              text-align:center;
            "
          >
            <h1 style="margin-top:0;color:#111827;">
              Verify your email
            </h1>

            <p style="color:#4b5563;line-height:1.6;">
              Click the button below to complete your email verification.
            </p>

            <form method="post" action="/api/auth/verify-email">
              <input
                type="hidden"
                name="token"
                value="${safeToken}"
              />

              <button
                type="submit"
                style="
                  margin-top:16px;
                  padding:12px 28px;
                  border:0;
                  border-radius:6px;
                  background:#111827;
                  color:#fff;
                  font-size:15px;
                  font-weight:600;
                  cursor:pointer;
                "
              >
                Verify Email
              </button>
            </form>
          </main>
        </body>
      </html>
    `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  )
}

/**
 * 실제 이메일 인증은 사용자가 버튼을 눌러 POST한 경우에만 처리합니다.
 */
export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl()

  try {
    const formData = await req.formData()
    const tokenValue = formData.get('token')
    const token =
      typeof tokenValue === 'string'
        ? tokenValue.trim()
        : ''

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', baseUrl),
        303,
      )
    }

    const payload = await getPayload({
      config: configPromise,
    })

    const userQuery = await payload.find({
      collection: 'users',
      where: {
        and: [
          {
            emailVerificationToken: {
              equals: token,
            },
          },
          {
            emailVerificationExpires: {
              greater_than: new Date().toISOString(),
            },
          },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    const user = userQuery.docs[0]

    if (!user) {
      console.warn(
        '[Verify Email] Token is invalid, expired, or already used.',
      )

      return NextResponse.redirect(
        new URL(
          '/login?error=token_expired_or_invalid',
          baseUrl,
        ),
        303,
      )
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        emailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      overrideAccess: true,
    })

    return NextResponse.redirect(
      new URL('/login?verified=true', baseUrl),
      303,
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error)

    console.error('[Verify Email Error]:', message)

    return NextResponse.redirect(
      new URL('/login?error=server_error', baseUrl),
      303,
    )
  }
}