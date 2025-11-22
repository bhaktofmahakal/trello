import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized, created, ok, badRequest, serverError } from '@/lib/api'
import { z } from 'zod'

const createBoardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const boards = await db.board.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          {
            collaborations: {
              some: {
                userId: user.userId,
              },
            },
          },
        ],
      },
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
      orderBy: { createdAt: 'desc' },
    })

    return ok(boards)
  } catch (error) {
    console.error(error)
    return serverError()
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const body = await request.json()
    const { title, description } = createBoardSchema.parse(body)

    const board = await db.board.create({
      data: {
        title,
        description,
        ownerId: user.userId,
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

    return created(board)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid board data')
    }
    console.error(error)
    return serverError()
  }
}
