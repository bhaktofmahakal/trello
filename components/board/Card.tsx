'use client'

import { useState } from 'react'
import CardModal from './CardModal'

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

interface CardProps {
  card: CardData
  onDragStart: (e: React.DragEvent) => void
  onDelete: () => void
  onUpdate: (updatedCard: CardData) => void
}

export default function Card({ card, onDragStart, onDelete, onUpdate }: CardProps) {
  const [showModal, setShowModal] = useState(false)

  function getPriorityColor(priority?: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function formatDueDate(dueDate?: string) {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => setShowModal(true)}
        className="bg-white rounded-lg p-3 shadow hover:shadow-md transition cursor-move hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-medium text-gray-800 text-sm">{card.title}</p>
            {card.description && (
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">{card.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {card.priority && (
            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(card.priority)}`}>
              {card.priority}
            </span>
          )}
          {card.label && (
            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
              {card.label}
            </span>
          )}
          {card.dueDate && (
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
              {formatDueDate(card.dueDate)}
            </span>
          )}
        </div>
      </div>

      {showModal && (
        <CardModal
          card={card}
          onClose={() => setShowModal(false)}
          onDelete={() => {
            onDelete()
            setShowModal(false)
          }}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
