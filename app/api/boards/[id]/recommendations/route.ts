import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, unauthorized, notFound, forbidden, ok, serverError } from '@/lib/api'
import { generateBoardRecommendations } from '@/lib/recommendations'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const board = await db.board.findUnique({
      where: { id: params.id },
      select: {
        ownerId: true,
        collaborations: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!board) return notFound()

    const isOwner = board.ownerId === user.userId
    const isCollaborator = board.collaborations.some((c) => c.userId === user.userId)

    if (!isOwner && !isCollaborator) return forbidden()

    const recommendations = await generateBoardRecommendations(params.id)

    return ok(recommendations)
  } catch (error) {
    console.error(error)
    return serverError()
  }
}
