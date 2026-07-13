import { NextRequest, NextResponse } from 'next/server'

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('payload-token')?.value

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      reason: 'no_token',
      remainingSeconds: null,
    })
  }

  const decoded = decodeJwtPayload(token)

  if (!decoded?.exp) {
    return NextResponse.json({
      authenticated: true,
      reason: 'active',
      remainingSeconds: null,
    })
  }

  const now = Math.floor(Date.now() / 1000)
  const remainingSeconds = decoded.exp - now

  // console.log(
  //   '[SESSION]',
  //   'remainingSeconds:',
  //   remainingSeconds,
  //   'minutes:',
  //   Math.round(remainingSeconds / 60),
  // )

  if (remainingSeconds <= 0) {
    return NextResponse.json({
      authenticated: false,
      reason: 'expired',
      remainingSeconds: 0,
    })
  }

  return NextResponse.json({
    authenticated: true,
    reason: 'active',
    remainingSeconds,
  })
}