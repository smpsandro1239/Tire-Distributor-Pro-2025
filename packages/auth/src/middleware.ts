import { NextRequest, NextResponse } from 'next/server'
import { getTenantFromUser, getUser } from './auth'

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await getUser(token)
    const tenantId = await getTenantFromUser(user.id)

    return NextResponse.next({
      request: {
        headers: new Headers({
          ...request.headers,
          'x-user-id': user.id,
          'x-tenant-id': tenantId || '',
        }),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
