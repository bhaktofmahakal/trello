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
  created,
} from '@/lib/api'
import { z } from 'zod'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

const inviteSchema = z.object({
  email: z.string().email(),
})

async function sendInvitationEmail(email: string, boardTitle: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const invitationUrl = `${process.env.NEXT_PUBLIC_API_URL}/invitations/${token}`

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject: `You're invited to collaborate on "${boardTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Board Collaboration Invitation</h2>
        <p>You've been invited to collaborate on the board: <strong>${boardTitle}</strong></p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${invitationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const board = await db.board.findUnique({
      where: { id: params.id },
      select: { ownerId: true, title: true },
    })

    if (!board) return notFound()
    if (board.ownerId !== user.userId) return forbidden()

    const body = await request.json()
    const { email } = inviteSchema.parse(body)

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      return badRequest('User with this email does not exist')
    }

    const existingCollaboration = await db.collaboration.findFirst({
      where: {
        boardId: params.id,
        userId: existingUser.id,
      },
    })

    if (existingCollaboration) {
      return badRequest('User is already a collaborator on this board')
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await db.invitation.create({
      data: {
        email,
        boardId: params.id,
        invitedBy: user.userId,
        token,
        expiresAt,
      },
    })

    try {
      console.log('Sending invitation email to:', email, 'for board:', board.title)
      await sendInvitationEmail(email, board.title, token)
      console.log('Invitation email sent successfully')
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return created(invitation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid invitation data')
    }
    console.error(error)
    return serverError()
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    if (!user) return unauthorized()

    const board = await db.board.findUnique({
      where: { id: params.id },
      select: { ownerId: true, title: true },
    })

    if (!board) return notFound()
    if (board.ownerId !== user.userId) return forbidden()

    const invitations = await db.invitation.findMany({
      where: { boardId: params.id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok(invitations)
  } catch (error) {
    console.error(error)
    return serverError()
  }
}
