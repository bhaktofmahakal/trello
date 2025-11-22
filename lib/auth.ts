import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'

export interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return (jwt as any).verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('auth-token')
  return cookie?.value || null
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function getUserFromToken(): Promise<TokenPayload | null> {
  const token = await getAuthCookie()
  if (!token) return null
  return verifyToken(token)
}
