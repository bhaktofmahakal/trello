import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  requireAuth,
  unauthorized,
  notFound,
  badRequest,
  ok,
  serverError,
} from '@/lib/api'

export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const invitation = await db.invitation.findUnique({
      where: { token: params.token },
    })

    if (!invitation) return notFound()

    if (invitation.email !== user.email) {
      return badRequest('This invitation is not for your email address')
    }

    if (invitation.expiresAt < new Date()) {
      return badRequest('This invitation has expired')
    }

    if (invitation.status === 'accepted') {
      return badRequest('This invitation has already been accepted')
    }

    await db.collaboration.create({
      data: {
        userId: user.userId,
        boardId: invitation.boardId,
      },
    })

    await db.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
      },
    })

    const board = await db.board.findUnique({
      where: { id: invitation.boardId },
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

    return ok({
      message: 'Invitation accepted',
      board,
    })
  } catch (error) {
    console.error(error)
    return serverError()
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const invitation = await db.invitation.findUnique({
      where: { token: params.token },
      include: {
        board: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!invitation) return notFound()

    if (invitation.expiresAt < new Date()) {
      return badRequest('This invitation has expired')
    }

    return ok(invitation)
  } catch (error) {
    console.error(error)
    return serverError()
  }
}
