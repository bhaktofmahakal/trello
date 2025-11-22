import { NextResponse } from 'next/server'
import { getUserFromToken } from './auth'

export async function requireAuth() {
  const user = await getUserFromToken()
  if (!user) {
    return null
  }
  return user
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

export function forbidden() {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  )
}

export function notFound() {
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  )
}

export function badRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 })
}

export function serverError(message: string = 'Internal server error') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}
