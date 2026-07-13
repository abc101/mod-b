export function getRequestInfo(req: any) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const userAgent = req.headers.get('user-agent') || ''

  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    'unknown'

  return {
    ipAddress,
    userAgent,
  }
}

export async function createLoginLog({
  payload,
  user,
  req,
  eventType = 'login',
  loginMethod = 'password',
  success = true,
  message = '',
}: {
  payload: any
  user: any
  req: any
  eventType?: 'login' | 'logout'
  loginMethod?: 'password' | 'google' | 'naver' | 'kakao' | 'facebook' | string
  success?: boolean
  message?: string
}) {
  try {
    const { ipAddress, userAgent } = getRequestInfo(req)

    await payload.create({
      collection: 'login-logs',
      data: {
        eventType,
        user: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        loginMethod,
        success,
        message,
      },
      overrideAccess: true,
    })
  } catch (err: any) {
    console.error('Failed to create login log:', err?.message)
  }
}