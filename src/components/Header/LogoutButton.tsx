'use client'

import { usePathname, useRouter } from 'next/navigation'

type Props = {
  className?: string
  label?: string
}

export default function LogoutButton({ className, label = 'Logout' }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    sessionStorage.setItem('manual_logout', 'true')

    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.reload()
  }

  return (
    <button
      onClick={handleLogout}
      className={`text-gray-600 hover:text-gray-900 cursor-pointer transition-colors ${className || ''}`}
    >
      {label}
    </button>
  )
}
