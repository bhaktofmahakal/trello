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

const updateBoardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const board = await db.board.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collaborations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    })

    if (!board) return notFound()

    const isOwner = board.ownerId === user.userId
    const isCollaborator = board.collaborations.some((c) => c.userId === user.userId)

    if (!isOwner && !isCollaborator) return forbidden()

    return ok(board)
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

    const board = await db.board.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })

    if (!board) return notFound()
    if (board.ownerId !== user.userId) return forbidden()

    const body = await request.json()
    const { title, description } = updateBoardSchema.parse(body)

    const updatedBoard = await db.board.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return ok(updatedBoard)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid board data')
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

    const board = await db.board.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })

    if (!board) return notFound()
    if (board.ownerId !== user.userId) return forbidden()

    await db.board.delete({
      where: { id: params.id },
    })

    return ok({ message: 'Board deleted' })
  } catch (error) {
    console.error(error)
    return serverError()
  }
}
