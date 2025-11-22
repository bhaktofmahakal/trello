'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth'

interface Board {
  id: string
  title: string
  description?: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [isBoardsLoading, setIsBoardsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth')
      return
    }
    fetchBoards()
  }, [user, loading])

  async function fetchBoards() {
    try {
      const response = await fetch('/api/boards')
      if (response.ok) {
        const data = await response.json()
        setBoards(data)
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error)
    } finally {
      setIsBoardsLoading(false)
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      if (response.ok) {
        const newBoard = await response.json()
        setBoards([newBoard, ...boards])
        setTitle('')
        setDescription('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleLogout() {
    await logout()
    router.push('/auth')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Trello Clone</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Boards</h2>

          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + Create New Board
            </button>
          ) : (
            <form onSubmit={handleCreateBoard} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter board title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreating}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter board description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isCreating}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {isBoardsLoading ? (
          <div className="text-center py-12">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No boards yet. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{board.title}</h3>
                {board.description && (
                  <p className="text-gray-600 text-sm mb-4">{board.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
