import type { User } from '@/payload-types'
import type { SeedContext } from './utils'
import { logStep, upsertByUnique } from './utils'

export type SeedUsers = {
  admin: User
  manager: User
  editor: User
  members: User[]
  inactive: User
}

const PASSWORD = process.env.MOD_B_SEED_PASSWORD || 'ModB-Demo-2026!'

export async function seedUsers({ payload }: SeedContext): Promise<SeedUsers> {
  logStep('Seeding users')

  const admin = await upsertByUnique<User>({
    payload,
    collection: 'users',
    uniqueField: 'email',
    uniqueValue: 'admin@mod-b.local',
    data: {
      email: 'admin@mod-b.local',
      password: PASSWORD,
      name: 'Mod-B Admin',
      nickname: 'modb-admin',
      role: 'admin',
      level: 99,
      isActive: true,
      emailVerified: true,
      termsAccepted: true,
      profileCompleted: true,
      bio: 'Seed admin account for full QA coverage.',
    },
  })

  const manager = await upsertByUnique<User>({
    payload,
    collection: 'users',
    uniqueField: 'email',
    uniqueValue: 'manager@mod-b.local',
    data: {
      email: 'manager@mod-b.local',
      password: PASSWORD,
      name: 'Mod-B Manager',
      nickname: 'modb-manager',
      role: 'manager',
      level: 10,
      isActive: true,
      emailVerified: true,
      termsAccepted: true,
      profileCompleted: true,
      bio: 'Seed manager account assigned to manager-only boards.',
    },
  })

  const editor = await upsertByUnique<User>({
    payload,
    collection: 'users',
    uniqueField: 'email',
    uniqueValue: 'editor@mod-b.local',
    data: {
      email: 'editor@mod-b.local',
      password: PASSWORD,
      name: 'Mod-B Editor',
      nickname: 'modb-editor',
      role: 'member',
      level: 5,
      isActive: true,
      emailVerified: true,
      termsAccepted: true,
      profileCompleted: true,
      bio: 'Seed editor-like member used for content ownership tests.',
    },
  })

  const members: User[] = []
  for (let i = 1; i <= 12; i++) {
    members.push(
      await upsertByUnique<User>({
        payload,
        collection: 'users',
        uniqueField: 'email',
        uniqueValue: `member${i}@mod-b.local`,
        data: {
          email: `member${i}@mod-b.local`,
          password: PASSWORD,
          name: `Mod-B Member ${i}`,
          nickname: `modb-member-${i}`,
          role: 'member',
          level: 1 + (i % 5),
          isActive: true,
          emailVerified: true,
          termsAccepted: true,
          profileCompleted: true,
          bio: `Seed member ${i} for post/comment/bookmark/notification tests.`,
        },
      }),
    )
  }

  const inactive = await upsertByUnique<User>({
    payload,
    collection: 'users',
    uniqueField: 'email',
    uniqueValue: 'inactive@mod-b.local',
    data: {
      email: 'inactive@mod-b.local',
      password: PASSWORD,
      name: 'Mod-B Inactive',
      nickname: 'modb-inactive',
      role: 'member',
      level: 1,
      isActive: false,
      emailVerified: false,
      termsAccepted: false,
      profileCompleted: false,
      bio: 'Inactive account for login restriction checks.',
    },
  })

  console.log(`   Login password for Mod-B demo users: ${PASSWORD}`)
  return { admin, manager, editor, members, inactive }
}
