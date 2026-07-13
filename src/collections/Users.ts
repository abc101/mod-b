import type { CollectionConfig } from 'payload'
import crypto from 'crypto' 
import { createLoginLog } from '@/lib/login-log'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'nickname', 'role', 'level', 'isActive', 'createdAt', 'isDeleted', 'deletedAt', 'termsAccepted', 'profileCompleted'],
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const resetUrl = `${baseUrl}/reset-password?token=${token}`

        return `
          <div style="max-width:600px; margin:0 auto; font-family:sans-serif; padding:20px;">
            <h2 style="color:#111;">Password Reset Request</h2>
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the button below to complete the process:</p>
            
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #111827; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color:#666; font-size:14px;">
              Or copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color:#4285f4; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color:#666; font-size:14px; font-weight:bold; margin-top:20px;">
              This link will expire in 1 hour.
            </p>

            <p style="color:#999; font-size:12px; margin-top:16px;">
              If you did not request this, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        `
      },
      expiration: 3600000,
      generateEmailSubject: () => {
        return 'Password Reset Request'
      },
    },
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && !data.socialProvider) {
          if (data.role === 'admin') {
            data.emailVerified = true
            data.isActive = true
            return data
          }

          const settings = await req.payload.findGlobal({ slug: 'site-settings' }) as any
          const requireVerification = settings?.email?.requireEmailVerification ?? true

          if (requireVerification) {
            const token = crypto.randomBytes(32).toString('hex')
            const expires = new Date()
            expires.setHours(expires.getHours() + 24)

            data.emailVerificationToken = token
            data.emailVerificationExpires = expires.toISOString()
            data.emailVerified = false
            data.isActive = false
          } else {
            data.emailVerified = false
            data.isActive = true
          }
        }
        return data
      }
    ],

    afterChange: [
      async ({ doc, operation, req }) => {
        if (
          operation !== 'create' ||
          doc.socialProvider ||
          doc.role === 'admin'
        ) {
          return
        }

        try {
          const settings = (await req.payload.findGlobal({
            slug: 'site-settings',
          })) as any

          const requireVerification =
            settings?.email?.requireEmailVerification ?? true

          if (!requireVerification) {
            return
          }

          const savedToken = doc.emailVerificationToken

          if (!savedToken) {
            console.error(
              '❌ [Mail Error] Email verification is enabled, but the saved token was not found.',
            )
            return
          }

          const { sendVerificationEmail } = await import('@/lib/mailer')

          await sendVerificationEmail({
            email: doc.email,
            token: savedToken,
          })
        } catch (mailError: unknown) {
          const message =
            mailError instanceof Error
              ? mailError.message
              : String(mailError)

          console.error('❌ [Mail Hook Exception]:', message)
        }
      },
    ],

    beforeLogin: [
      async ({ req, user }) => {
        if (user.role === 'admin' || user.socialProvider) {
          return user
        }

        const settings = await req.payload.findGlobal({ slug: 'site-settings' }) as any
        const isVerificationRequired = settings?.email?.requireEmailVerification ?? true

        if (isVerificationRequired && (!user.emailVerified || !user.isActive)) {
          throw new Error('Your email verification is incomplete, or your account is inactive. Please check your inbox.')
        }

        return user
      }
    ],

    afterLogin: [
      async ({ req, user }) => {
        
        if (user.socialProvider) {
          return user
        }

        createLoginLog({
          payload: req.payload,
          user,
          req,
          eventType: 'login',
          loginMethod: user.socialProvider || 'password',
          success: true,
          message: 'Login successful',
        }).catch((err: any) => {
          console.error('Failed to create login log:', err?.message)
        })

        return user
      },
    ],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
      validate: async (value: any, options: any) => {
        const operation = options?.operation
        const id = options?.id
        const req = options?.req

        const isSocialAccount =
          !!options?.siblingData?.socialProvider ||
          !!options?.data?.socialProvider

        if (isSocialAccount) return true
        if (!value) return 'Name is required.'
        if (!req || !req.payload) return true

        const cleanInputValue = value.trim()

        if (cleanInputValue.length < 2) {
          return 'Name must be at least 2 characters long.'
        }
        
        const lowercaseValue = cleanInputValue.normalize('NFC').toLowerCase()

        try {
          const settings = await req.payload.findGlobal({ 
            slug: 'site-settings',
            overrideAccess: true,
            req,
          }) as any
          
          const forbiddenString = settings?.forbiddenWords?.registration || ''

          if (forbiddenString) {
            const forbiddenWords = forbiddenString
              .split(',')
              .map((word: string) => word.replace(/\s+/g, '').normalize('NFC').toLowerCase())
              .filter(Boolean)

            if (forbiddenWords.some((word: string) => lowercaseValue.includes(word))) {
              return 'This name contains a forbidden word.'
            }
          }
        } catch (err: any) {
          console.error('❌ [Validate Name - Global Error]:', err.message)
        }

        return true
      }
    },
    {
      name: 'nickname',
      type: 'text',
      label: 'Nickname',
      required: true,
      validate: async (value: any, options: any) => {
        const operation = options?.operation
        const id = options?.id
        const req = options?.req

        const isSocialAccount =
          !!options?.siblingData?.socialProvider ||
          !!options?.data?.socialProvider

        if (!value || !value.trim()) return 'Nickname is required.'
        if (!req || !req.payload) return true

        const cleanInputValue = value.trim()

        if (cleanInputValue.length < 2) {
          return 'Nickname must be at least 2 characters long.'
        }

        const lowercaseValue = cleanInputValue.normalize('NFC').toLowerCase()

        if (!isSocialAccount) {
          try {
            const settings = await req.payload.findGlobal({ 
              slug: 'site-settings',
              overrideAccess: true,
              req,
            }) as any
            
            const forbiddenString = settings?.forbiddenWords?.registration || ''
            
            if (forbiddenString) {
              const forbiddenWords = forbiddenString
                .split(',')
                .map((word: string) => word.replace(/\s+/g, '').normalize('NFC').toLowerCase())
                .filter(Boolean)

              if (forbiddenWords.some((word: string) => lowercaseValue.includes(word))) {
                return 'This nickname contains a forbidden word.'
              }
            }
          } catch (err: any) {
            console.error('❌ [Validate Nickname - Global Error]:', err.message)
          }
        }


        if (operation === 'create' || operation === 'update') {
          try {
            const users = await req.payload.find({
              collection: 'users',
              where: {
                nickname: { equals: cleanInputValue },
              },
              limit: 1,
              overrideAccess: true,
              req,
            })

            if (users.docs.length > 0) {
              const foundUser = users.docs[0] as any
              if (operation === 'create' || (operation === 'update' && foundUser.id !== id)) {
                return 'This nickname is already in use.'
              }
            }
          } catch (err: any) {
            console.error('❌ [Validate Nickname - DB Error]:', err.message)
            return 'An error occurred while validating nickname uniqueness.'
          }
        }

        return true
      }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      defaultValue: 'member',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager'},
        { label: 'Member', value: 'member' },
      ],
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'level',
      type: 'number',
      label: 'Level',
      defaultValue: 1,
      admin: {
        description: 'User level for gamification',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active Account',
      defaultValue: false,
      admin: {
        description: 'Inactive accounts cannot log in',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      label: 'Profile Image',
      relationTo: 'media',
    },
    {
      name: 'socialAvatarUrl',
      type: 'text',
      label: 'Social Avatar URL',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      label: 'Email Verified',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'emailVerificationToken',
      type: 'text',
      label: 'Email Verification Token',
      admin: { readOnly: true },
    },
    {
      name: 'emailVerificationExpires',
      type: 'date',
      label: 'Email Verification Token Expires',
      admin: { readOnly: true },
    },
    {
      name: 'socialProvider',
      type: 'select',
      label: 'Social Provider',
      admin: {
        readOnly: true,
        description: 'Social login provider used to create this account',
      },
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Naver', value: 'naver' },
        { label: 'Kakao', value: 'kakao' },
        { label: 'Facebook', value: 'facebook' },
      ],
    },
    {
      name: 'socialProviderAccountId',
      type: 'text',
      label: 'Social Provider Account ID',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'termsAccepted',
      type: 'checkbox',
      label: 'Terms Accepted',
      defaultValue: false,
    },
    {
      name: 'profileCompleted',
      type: 'checkbox',
      label: 'Profile Completed',
      defaultValue: false,
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  access: {
    read: () => true,
    create: () => true,
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return {
        id: { equals: req.user?.id },
      }
    },
    delete: ({ req }) => req.user?.role === 'admin',
    admin: ({ req }) => req.user?.role === 'admin',
  },
}