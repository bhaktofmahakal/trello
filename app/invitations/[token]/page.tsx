'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth'

export default function AcceptInvitationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const token = params.token as string

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth')
      return
    }
    acceptInvitation()
  }, [user, loading])

  async function acceptInvitation() {
    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setStatus('success')
        setMessage(`Successfully joined "${data.board.title}" board!`)
        setTimeout(() => {
          router.push(`/boards/${data.board.id}`)
        }, 2000)
      } else {
        const error = await response.json()
        setStatus('error')
        setMessage(error.error || 'Failed to accept invitation')
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      setStatus('error')
      setMessage('An error occurred while accepting the invitation')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Board Invitation</h1>

        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Accepting invitation...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-gray-800 mb-4">{message}</p>
            <p className="text-gray-600">Redirecting to board...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <p className="text-red-800 mb-4">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}