'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react'

import AnonymousPasswordDialog from '@/components/AnonymousPasswordDialog'
import {
  verifyAnonymousPostPassword,
  verifyAnonymousCommentPassword,
} from '@/app/(frontend)/board/[slug]/[id]/anonymous-actions'

type ResourceType = 'post' | 'comment'

type VerifyResourceOptions = {
  type: ResourceType
  id: number
  title?: string
  message?: string
  confirmLabel?: string
}

type AnonymousAccessContextType = {
  verifyResource: (options: VerifyResourceOptions) => Promise<boolean>

  // compatibility helpers
  verifyPost: (
    options: Omit<VerifyResourceOptions, 'type'>,
  ) => Promise<boolean>
  verifyComment: (
    options: Omit<VerifyResourceOptions, 'type'>,
  ) => Promise<boolean>
}

const AnonymousAccessContext =
  createContext<AnonymousAccessContextType | null>(null)

export function AnonymousAccessProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] =
    useState<VerifyResourceOptions | null>(null)

  const [resolver, setResolver] =
    useState<((value: boolean) => void) | null>(null)

  const verifyResource = (nextOptions: VerifyResourceOptions) => {
    setOptions(nextOptions)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve)
    })
  }

  const verifyPost = (
    nextOptions: Omit<VerifyResourceOptions, 'type'>,
  ) => {
    return verifyResource({
      ...nextOptions,
      type: 'post',
    })
  }

  const verifyComment = (
    nextOptions: Omit<VerifyResourceOptions, 'type'>,
  ) => {
    return verifyResource({
      ...nextOptions,
      type: 'comment',
    })
  }

  const close = () => {
    setOpen(false)
    setOptions(null)

    if (resolver) {
      resolver(false)
      setResolver(null)
    }
  }

  const handleConfirm = async (password: string) => {
    if (!options) return

    if (!options.id) {
      throw new Error('Missing resource ID.')
    }

    if (options.type === 'comment') {
      await verifyAnonymousCommentPassword(options.id, password)
    } else {
      await verifyAnonymousPostPassword(options.id, password)
    }

    setOpen(false)
    setOptions(null)

    if (resolver) {
      resolver(true)
      setResolver(null)
    }
  }

  return (
    <AnonymousAccessContext.Provider
      value={{
        verifyResource,
        verifyPost,
        verifyComment,
      }}
    >
      {children}

      <AnonymousPasswordDialog
        open={open}
        title={options?.title || 'Enter Password'}
        message={options?.message || 'Please enter the password.'}
        confirmLabel={options?.confirmLabel || 'Confirm'}
        onClose={close}
        onConfirm={handleConfirm}
      />
    </AnonymousAccessContext.Provider>
  )
}

export function useAnonymousAccess() {
  const context = useContext(AnonymousAccessContext)

  if (!context) {
    throw new Error(
      'useAnonymousAccess must be used within AnonymousAccessProvider',
    )
  }

  return context
}