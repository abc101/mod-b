import type { LoginLog, User } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedUsers } from './users'
import { logStep, pick, upsertByUnique } from './utils'

export async function seedLoginLogs(
  { payload }: SeedContext,
  users: SeedUsers,
): Promise<LoginLog[]> {
  logStep('Seeding login logs')

  const docs: LoginLog[] = []
  const userPool: User[] = [users.admin, users.manager, users.editor, ...users.members.slice(0, 8), users.inactive]
  const eventTypes = ['login', 'logout'] as const
  const methods = ['password', 'google', 'facebook', 'kakao', 'naver'] as const

  for (let i = 0; i < 32; i++) {
    const user = pick(userPool, i)
    const eventType = pick([...eventTypes], i)
    const success = i % 7 !== 0
    const ipAddress = `127.0.4.${i + 1}`

    docs.push(await upsertByUnique<LoginLog>({
      payload,
      collection: 'login-logs',
      uniqueField: 'ipAddress',
      uniqueValue: ipAddress,
      data: {
        eventType,
        user: user.id,
        email: user.email,
        ipAddress,
        userAgent: 'Mod-B Seed Login Browser',
        loginMethod: pick([...methods], i),
        success,
      },
    }))
  }

  return docs
}
