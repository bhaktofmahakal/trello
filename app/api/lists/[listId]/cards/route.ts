import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  requireAuth,
  unauthorized,
  notFound,
  forbidden,
  badRequest,
  serverError,
  created,
} from '@/lib/api'
import { z } from 'zod'

const createCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const list = await db.list.findUnique({
      where: { id: params.listId },
      select: {
        boardId: true,
        board: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!list) return notFound()

    const isOwner = list.board.ownerId === user.userId
    const isCollaborator = await db.collaboration.findFirst({
      where: {
        boardId: list.boardId,
        userId: user.userId,
      },
    })

    if (!isOwner && !isCollaborator) return forbidden()

    const body = await request.json()
    const { title, description, dueDate, priority } = createCardSchema.parse(body)

    const cardCount = await db.card.count({
      where: { listId: params.listId },
    })

    const card = await db.card.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        listId: params.listId,
        position: cardCount,
      },
    })

    return created(card)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid card data')
    }
    console.error(error)
    return serverError()
  }
}
