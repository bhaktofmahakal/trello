'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }, [user, loading])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Trello Clone</h1>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
