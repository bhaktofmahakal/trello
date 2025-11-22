'use client'

import { useEffect, useState } from 'react'

interface Recommendation {
  id: string
  type: 'due-date' | 'list-move' | 'related-cards'
  card: { id: string; title: string }
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  action?: {
    type: string
    targetListId?: string
    dueDate?: string
    relatedCards?: Array<{ id: string; title: string }>
  }
}

interface RecommendationsPanelProps {
  boardId: string
}

export default function RecommendationsPanel({ boardId }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [boardId])

  async function fetchRecommendations() {
    try {
      const response = await fetch(`/api/boards/${boardId}/recommendations`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  function getPriorityBadgeColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-200 text-red-800'
      case 'medium':
        return 'bg-yellow-200 text-yellow-800'
      case 'low':
        return 'bg-blue-200 text-blue-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  async function applyRecommendation(rec: Recommendation) {
    if (!rec.action) return

    try {
      if (rec.type === 'due-date' && rec.action.dueDate) {
        await fetch(`/api/cards/${rec.card.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dueDate: rec.action.dueDate,
          }),
        })
      } else if (rec.type === 'list-move' && rec.action.targetListId) {
        await fetch(`/api/cards/${rec.card.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listId: rec.action.targetListId,
          }),
        })
      }

      setRecommendations(recommendations.filter((r) => r.id !== rec.id))
    } catch (error) {
      console.error('Failed to apply recommendation:', error)
    }
  }

  function dismissRecommendation(id: string) {
    setRecommendations(recommendations.filter((r) => r.id !== id))
  }

  return (
    <div className="flex-shrink-0 w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto max-h-screen">
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-bold text-lg text-gray-900">💡 Smart Recommendations</h3>
        <p className="text-xs text-gray-600 mt-1">AI-powered suggestions for your tasks</p>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <p>No recommendations at this time</p>
            <p className="mt-2 text-xs">Add more cards to get suggestions!</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityBadgeColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      {rec.type === 'due-date'
                        ? '📅'
                        : rec.type === 'list-move'
                        ? '🔄'
                        : '🔗'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{rec.card.title}</p>
                  <p className="text-sm text-gray-700 mt-2">{rec.suggestion}</p>

                  {rec.type === 'related-cards' && rec.action?.relatedCards && (
                    <div className="mt-3 space-y-1">
                      {rec.action.relatedCards.map((relCard) => (
                        <div
                          key={relCard.id}
                          className="text-xs text-gray-600 bg-white bg-opacity-50 px-2 py-1 rounded"
                        >
                          • {relCard.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissRecommendation(rec.id)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {(rec.type === 'due-date' || rec.type === 'list-move') && (
                <button
                  onClick={() => applyRecommendation(rec)}
                  className="w-full mt-3 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition font-medium"
                >
                  {rec.type === 'due-date' ? '✓ Set Due Date' : '✓ Move Card'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
