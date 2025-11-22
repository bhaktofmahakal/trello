'use client'

import { useState } from 'react'
import Card from './Card'

interface CardData {
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
  cards: CardData[]
}

interface ListColumnProps {
  list: List
  onListUpdate: (list: List) => void
  onCardMoved: (fromListId: string, toListId: string, cardId: string) => void
}

export default function ListColumn({
  list,
  onListUpdate,
  onCardMoved,
}: ListColumnProps) {
  const [showNewCard, setShowNewCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault()
    if (!newCardTitle.trim()) return

    setIsCreatingCard(true)
    try {
      const response = await fetch(`/api/lists/${list.id}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCardTitle }),
      })

      if (response.ok) {
        const newCard = await response.json()
        onListUpdate({
          ...list,
          cards: [...list.cards, newCard],
        })
        setNewCardTitle('')
        setShowNewCard(false)
      }
    } catch (error) {
      console.error('Failed to create card:', error)
    } finally {
      setIsCreatingCard(false)
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onListUpdate({
          ...list,
          cards: list.cards.filter((c) => c.id !== cardId),
        })
      }
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  function handleDragStart(e: React.DragEvent, cardId: string) {
    setDraggedCardId(cardId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (!draggedCardId) return

    const card = list.cards.find((c) => c.id === draggedCardId)
    if (!card) return

    try {
      await fetch(`/api/cards/${draggedCardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: list.id }),
      })

      onCardMoved(card.listId, list.id, draggedCardId)
    } catch (error) {
      console.error('Failed to move card:', error)
    } finally {
      setDraggedCardId(null)
    }
  }

  return (
    <div className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 shadow-sm">
      <h2 className="font-bold text-gray-900 mb-4 text-lg">{list.title}</h2>

      <div
        className="space-y-3 mb-4 min-h-12"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {list.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onDragStart={(e) => handleDragStart(e, card.id)}
            onDelete={() => handleDeleteCard(card.id)}
            onUpdate={(updatedCard) => {
              onListUpdate({
                ...list,
                cards: list.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
              })
            }}
          />
        ))}
      </div>

      {!showNewCard ? (
        <button
          onClick={() => setShowNewCard(true)}
          className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-200 rounded transition text-sm"
        >
          + Add a card
        </button>
      ) : (
        <form onSubmit={handleCreateCard} className="space-y-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isCreatingCard}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreatingCard}
              className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 disabled:opacity-50 transition text-sm"
            >
              {isCreatingCard ? '...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewCard(false)
                setNewCardTitle('')
              }}
              className="flex-1 bg-gray-300 text-gray-800 py-1 rounded hover:bg-gray-400 transition text-sm"
            >
              Close
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
