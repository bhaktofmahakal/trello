'use client'

import { useState } from 'react'
import ListColumn from './ListColumn'

interface Card {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority?: string
  label?: string
  position: number
  listId: string
}

interface List {
  id: string
  title: string
  position: number
  cards: Card[]
}

interface Board {
  id: string
  title: string
  lists: List[]
  ownerId: string
}

interface BoardViewProps {
  board: Board
}

export default function BoardView({ board }: BoardViewProps) {
  const [lists, setLists] = useState(board.lists || [])
  const [showNewList, setShowNewList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [isCreatingList, setIsCreatingList] = useState(false)

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault()
    if (!newListTitle.trim()) return

    setIsCreatingList(true)
    try {
      const response = await fetch(`/api/boards/${board.id}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newListTitle }),
      })

      if (response.ok) {
        const newList = await response.json()
        setLists([...lists, { ...newList, cards: [] }])
        setNewListTitle('')
        setShowNewList(false)
      }
    } catch (error) {
      console.error('Failed to create list:', error)
    } finally {
      setIsCreatingList(false)
    }
  }

  function handleCardMoved(fromListId: string, toListId: string, cardId: string) {
    setLists(
      lists.map((list) => {
        if (list.id === fromListId) {
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          }
        }
        if (list.id === toListId) {
          const card = lists
            .find((l) => l.id === fromListId)
            ?.cards.find((c) => c.id === cardId)
          if (card) {
            return {
              ...list,
              cards: [...list.cards, { ...card, listId: toListId }],
            }
          }
        }
        return list
      })
    )
  }

  return (
    <div className="overflow-x-auto p-6 min-h-screen">
      <div className="flex gap-6 pb-4">
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            onListUpdate={(updatedList) => {
              setLists(lists.map((l) => (l.id === updatedList.id ? updatedList : l)))
            }}
            onCardMoved={handleCardMoved}
          />
        ))}

        {!showNewList ? (
          <button
            onClick={() => setShowNewList(true)}
            className="flex-shrink-0 w-80 bg-gray-200 rounded-lg p-4 hover:bg-gray-300 transition font-medium text-gray-700 text-center"
          >
            + Add Another List
          </button>
        ) : (
          <div className="flex-shrink-0 w-80 bg-white rounded-lg p-4 shadow">
            <form onSubmit={handleCreateList}>
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreatingList}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreatingList}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isCreatingList ? 'Adding...' : 'Add List'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewList(false)
                    setNewListTitle('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
