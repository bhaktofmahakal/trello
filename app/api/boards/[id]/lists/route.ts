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

const createListSchema = z.object({
  title: z.string().min(1),
})

export async function POST(
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

    const isOwner = board.ownerId === user.userId
    const isCollaborator = await db.collaboration.findFirst({
      where: {
        boardId: params.id,
        userId: user.userId,
      },
    })

    if (!isOwner && !isCollaborator) return forbidden()

    const body = await request.json()
    const { title } = createListSchema.parse(body)

    const listCount = await db.list.count({
      where: { boardId: params.id },
    })

    const list = await db.list.create({
      data: {
        title,
        position: listCount,
        boardId: params.id,
      },
    })

    return created(list)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid list data')
    }
    console.error(error)
    return serverError()
  }
}
