'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LoginLink() {
  const pathname = usePathname() 

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const redirectUrl = isAuthPage ? '/' : pathname

  return (
    <Link 
      href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} 
      className="text-sm text-gray-600 hover:text-gray-900"
    >
      Login
    </Link>
  )
}