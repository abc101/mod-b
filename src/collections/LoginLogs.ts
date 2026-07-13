import type { CollectionConfig } from 'payload'

export const LoginLogs: CollectionConfig = {
  slug: 'login-logs',
  labels: {
    singular: 'Login Log',
    plural: 'Login Logs',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['eventType', 'email', 'user', 'ipAddress', 'loginMethod', 'success', 'createdAt'],
    group: 'User Management',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true

      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      label: 'Event Type',
      required: true,
      defaultValue: 'login',
      options: [
        { label: 'Login', value: 'login' },
        { label: 'Logout', value: 'logout' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'loginMethod',
      type: 'select',
      defaultValue: 'password',
      options: [
        { label: 'Password', value: 'password' },
        { label: 'Google', value: 'google' },
        { label: 'Naver', value: 'naver' },
        { label: 'Kakao', value: 'kakao' },
        { label: 'Facebook', value: 'facebook' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'success',
      type: 'checkbox',
      defaultValue: true,
    }
  ],
}