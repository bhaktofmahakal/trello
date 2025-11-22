import { db } from './db'

export interface Recommendation {
  id: string
  type: 'due-date' | 'list-move' | 'related-cards'
  card: { id: string; title: string }
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  action?: {
    type: string
    targetListId?: string
    dueDate?: Date
    relatedCards?: Array<{ id: string; title: string }>
  }
}

const URGENT_KEYWORDS = [
  'urgent',
  'asap',
  'immediately',
  'critical',
  'emergency',
  'deadline',
]
const HIGH_PRIORITY_KEYWORDS = ['soon', 'quickly', 'fast', 'high priority', 'important']


const IN_PROGRESS_KEYWORDS = ['started', 'in progress', 'working on', 'begun', 'underway']
const DONE_KEYWORDS = ['done', 'completed', 'finished', 'ready', 'deployed']

export function analyzeDueDateRecommendation(
  title: string,
  description: string | null
): { shouldSet: boolean; days: number; priority: 'high' | 'medium' | 'low' } | null {
  const text = (title + ' ' + (description || '')).toLowerCase()

  if (URGENT_KEYWORDS.some((kw) => text.includes(kw))) {
    return { shouldSet: true, days: 1, priority: 'high' }
  }

  if (HIGH_PRIORITY_KEYWORDS.some((kw) => text.includes(kw))) {
    return { shouldSet: true, days: 3, priority: 'medium' }
  }

  if (text.includes('tomorrow')) {
    return { shouldSet: true, days: 1, priority: 'high' }
  }

  if (text.includes('today')) {
    return { shouldSet: true, days: 0, priority: 'high' }
  }

  if (text.includes('next week')) {
    return { shouldSet: true, days: 7, priority: 'low' }
  }

  if (text.includes('next month')) {
    return { shouldSet: true, days: 30, priority: 'low' }
  }

  return null
}

export function analyzeListMoveRecommendation(
  listId: string,
  listTitle: string,
  cardTitle: string,
  cardDescription: string | null,
  availableLists: Array<{ id: string; title: string }>
): { targetListId: string; suggestion: string; priority: 'high' | 'medium' } | null {
  const text = (cardTitle + ' ' + (cardDescription || '')).toLowerCase()
  const currentListTitle = listTitle.toLowerCase()

  if (!currentListTitle.includes('in progress') && IN_PROGRESS_KEYWORDS.some((kw) => text.includes(kw))) {
    const inProgressList = availableLists.find((l) =>
      l.title.toLowerCase().includes('progress') || l.title.toLowerCase().includes('doing')
    )
    if (inProgressList && inProgressList.id !== listId) {
      return {
        targetListId: inProgressList.id,
        suggestion: `Move to "${inProgressList.title}" - card mentions "started" or "in progress"`,
        priority: 'medium',
      }
    }
  }

  if (!currentListTitle.includes('done') && DONE_KEYWORDS.some((kw) => text.includes(kw))) {
    const doneList = availableLists.find(
      (l) =>
        l.title.toLowerCase().includes('done') ||
        l.title.toLowerCase().includes('completed') ||
        l.title.toLowerCase().includes('finished')
    )
    if (doneList && doneList.id !== listId) {
      return {
        targetListId: doneList.id,
        suggestion: `Move to "${doneList.title}" - card content suggests completion`,
        priority: 'high',
      }
    }
  }

  return null
}

export async function findRelatedCards(
  boardId: string,
  cardId: string,
  cardTitle: string,
  cardDescription: string | null
): Promise<Array<{ id: string; title: string }>> {
  const allCards = await db.card.findMany({
    where: {
      list: {
        boardId,
      },
      id: {
        not: cardId,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
    },
  })

  const keywords = extractKeywords(cardTitle, cardDescription)
  const relatedCards: Array<{ id: string; title: string; score: number }> = []

  allCards.forEach((card) => {
    let score = 0
    const cardText = (card.title + ' ' + (card.description || '')).toLowerCase()

    keywords.forEach((keyword) => {
      if (cardText.includes(keyword)) {
        score += 1
      }
    })

    if (score > 0) {
      relatedCards.push({
        id: card.id,
        title: card.title,
        score,
      })
    }
  })

  return relatedCards
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ id, title }) => ({ id, title }))
}

function extractKeywords(title: string, description: string | null): string[] {
  const text = (title + ' ' + (description || '')).toLowerCase()
  const words = text.split(/\s+/)
  return words
    .filter(
      (word) =>
        word.length > 3 &&
        !['the', 'this', 'that', 'with', 'from', 'have', 'are'].includes(word)
    )
    .slice(0, 5)
}

export async function generateBoardRecommendations(boardId: string): Promise<Recommendation[]> {
  const lists = await db.list.findMany({
    where: { boardId },
    select: { id: true, title: true },
    orderBy: { position: 'asc' },
  })

  const cards = await db.card.findMany({
    where: {
      list: {
        boardId,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      listId: true,
    },
  })

  const recommendations: Recommendation[] = []

  for (const card of cards) {
    const list = lists.find((l) => l.id === card.listId)
    if (!list) continue

    const dueDateRec = analyzeDueDateRecommendation(card.title, card.description)
    if (dueDateRec && !card.dueDate) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + dueDateRec.days)

      recommendations.push({
        id: `due-${card.id}`,
        type: 'due-date',
        card: { id: card.id, title: card.title },
        suggestion: `Set due date for "${card.title}" - ${getDueDateText(dueDateRec.days)}`,
        priority: dueDateRec.priority,
        action: {
          type: 'set-due-date',
          dueDate,
        },
      })
    }

    const listMoveRec = analyzeListMoveRecommendation(
      card.listId,
      list.title,
      card.title,
      card.description,
      lists
    )
    if (listMoveRec) {
      recommendations.push({
        id: `move-${card.id}`,
        type: 'list-move',
        card: { id: card.id, title: card.title },
        suggestion: listMoveRec.suggestion,
        priority: listMoveRec.priority,
        action: {
          type: 'move-card',
          targetListId: listMoveRec.targetListId,
        },
      })
    }

    const relatedCards = await findRelatedCards(boardId, card.id, card.title, card.description)
    if (relatedCards.length > 0) {
      recommendations.push({
        id: `related-${card.id}`,
        type: 'related-cards',
        card: { id: card.id, title: card.title },
        suggestion: `"${card.title}" is related to ${relatedCards.length} other card${relatedCards.length > 1 ? 's' : ''}`,
        priority: 'low',
        action: {
          type: 'show-related',
          relatedCards,
        },
      })
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

function getDueDateText(days: number): string {
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === 7) return 'next week'
  if (days === 30) return 'next month'
  return `in ${days} days`
}
