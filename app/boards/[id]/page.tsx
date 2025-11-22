'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/auth'
import BoardView from '@/components/board/BoardView'
import RecommendationsPanel from '@/components/board/RecommendationsPanel'

interface BoardData {
  id: string
  title: string
  description?: string
  ownerId: string
  lists: Array<{
    id: string
    title: string
    position: number
    cards: Array<{
      id: string
      title: string
      description?: string
      dueDate?: string
      priority?: string
      label?: string
      position: number
      listId: string
    }>
  }>
}

export default function BoardPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [board, setBoard] = useState<BoardData | null>(null)
  const [isBoardLoading, setIsBoardLoading] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const boardId = params.id as string

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth')
      return
    }
    fetchBoard()
  }, [user, loading])

  async function fetchBoard() {
    try {
      const response = await fetch(`/api/boards/${boardId}`)
      if (response.ok) {
        const data = await response.json()
        setBoard(data)
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
    } finally {
      setIsBoardLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      const response = await fetch(`/api/boards/${boardId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (response.ok) {
        setInviteEmail('')
        setShowInvite(false)
        alert('Invitation sent successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      alert('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  if (loading || isBoardLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!board) {
    return <div className="flex items-center justify-center min-h-screen">Board not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              👥 Invite
            </button>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-medium"
            >
              💡 Recommendations {showRecommendations ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {showInvite && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <form onSubmit={handleInvite} className="bg-white p-4 rounded-lg shadow-sm border flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isInviting}
                required
              />
              <button
                type="submit"
                disabled={isInviting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </nav>

      <div className="flex">
        <div className="flex-1">
          <BoardView board={board} />
        </div>
        {showRecommendations && (
          <RecommendationsPanel boardId={boardId} />
        )}
      </div>
    </div>
  )
}
