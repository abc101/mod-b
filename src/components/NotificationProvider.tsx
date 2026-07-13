'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type NotificationItem = {
  id: number
  title: string
  message?: string
  href?: string
  isRead?: boolean
  createdAt?: string
}

type NotificationContextType = {
  unreadCount: number
  items: NotificationItem[]
  loading: boolean
  refresh: () => Promise<void>
  setUnreadCount: (count: number) => void
  setItems: (items: NotificationItem[]) => void
}

const NotificationContext =
  createContext<NotificationContextType | null>(null)

export function NotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/notifications', {
        cache: 'no-store',
      })

      if (!res.ok) return

      const data = await res.json()

      setUnreadCount(data.unreadCount || 0)
      setItems(data.notifications || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()

    const timer = setInterval(refresh, 30_000)

    return () => clearInterval(timer)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        items,
        loading,
        refresh,
        setUnreadCount,
        setItems,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    )
  }

  return context
}