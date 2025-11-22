import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  requireAuth,
  unauthorized,
  notFound,
  forbidden,
  ok,
  badRequest,
  serverError,
} from '@/lib/api'
import { z } from 'zod'

const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  priority: z.string().optional(),
  label: z.string().optional(),
  listId: z.string().optional(),
})

async function canAccessCard(userId: string, cardId: string) {
  const card = await db.card.findUnique({
    where: { id: cardId },
    select: {
      list: {
        select: {
          board: {
            select: {
              ownerId: true,
              collaborations: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!card) return false

  const board = card.list.board
  const isOwner = board.ownerId === userId
  const isCollaborator = board.collaborations.some((c) => c.userId === userId)

  return isOwner || isCollaborator
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const canAccess = await canAccessCard(user.userId, params.id)
    if (!canAccess) return forbidden()

    const card = await db.card.findUnique({
      where: { id: params.id },
    })

    if (!card) return notFound()

    return ok(card)
  } catch (error) {
    console.error(error)
    return serverError()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const canAccess = await canAccessCard(user.userId, params.id)
    if (!canAccess) return forbidden()

    const body = await request.json()
    const { title, description, dueDate, priority, label, listId } =
      updateCardSchema.parse(body)

    const updateData: Record<string, unknown> = {}

    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (priority !== undefined) updateData.priority = priority
    if (label !== undefined) updateData.label = label
    if (listId) updateData.listId = listId

    const card = await db.card.update({
      where: { id: params.id },
      data: updateData,
    })

    return ok(card)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid card data')
    }
    console.error(error)
    return serverError()
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const canAccess = await canAccessCard(user.userId, params.id)
    if (!canAccess) return forbidden()

    await db.card.delete({
      where: { id: params.id },
    })

    return ok({ message: 'Card deleted' })
  } catch (error) {
    console.error(error)
    return serverError()
  }
}
