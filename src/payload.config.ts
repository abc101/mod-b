import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import nodemailer from 'nodemailer'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Boards } from './collections/Boards'
import { Posts } from './collections/Posts'
import { Comments } from './collections/Comments'
import { Advertisements } from './collections/Advertisements'
import { Pages } from './collections/Pages'
import { Announcements } from './collections/Announcements'

import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { LoginLogs } from './collections/LoginLogs'
import { DateTimeSettings } from './globals/DateTimeSettings'
import { AuditLogs } from './collections/AuditLogs'
import { Reports } from './collections/Reports'
import { Notifications } from './collections/Notifications'
import { BookmarkFolders } from './collections/BookmarkFolders'
import { BookmarkItems } from './collections/BookmarkItems'
import { MediaCategories } from './collections/MediaCategories'

const payloadSecret = process.env.PAYLOAD_SECRET

if (!payloadSecret || payloadSecret.length < 32) {
  throw new Error(
    'PAYLOAD_SECRET must be configured and contain at least 32 characters.',
  )
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtpConfigured =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASSWORD &&
  process.env.SMTP_HOST.trim() != ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- Mod-B',
    },
    components: {
      beforeLogin: ['/components/admin/LoginLogo'],
    },
  },
  // Email adapter
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress:
          process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
        defaultFromName: process.env.SMTP_FROM_NAME || 'Mod-B',

        transport: nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),

          secure: process.env.SMTP_SECURE === 'true',
          requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',

          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },

          tls: {
            servername:
              process.env.SMTP_TLS_SERVERNAME || process.env.SMTP_HOST,
            rejectUnauthorized:
              process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
          },
        }),
      })
    : undefined,
  collections: [
    Users,
    Media,
    Boards,
    Posts,
    Comments,
    Advertisements,
    Pages,
    Announcements,
    LoginLogs,
    AuditLogs,
    Reports,
    Notifications,
    BookmarkFolders,
    BookmarkItems,
    MediaCategories,
  ],
  globals: [
    SiteSettings,
    Navigation,
    DateTimeSettings,
  ],
  editor: lexicalEditor(),
  secret: payloadSecret,
  upload: {
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
    abortOnLimit: true,
    responseOnLimit: 'File size exceeds the 20MB upload limit.',
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
