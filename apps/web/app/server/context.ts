import { prisma } from '@tire-distributor/db'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts

  // Get tenant from subdomain or header
  const host = req.headers.host || ''
  const subdomain = host.split('.')[0]

  let tenantId: string | null = null

  // Extract tenant from subdomain (for child tenants)
  if (subdomain && subdomain !== 'www' && subdomain !== 'tiredist' && subdomain !== 'localhost:3000') {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: subdomain }
    })
    tenantId = tenant?.id || null
  }

  return {
    req,
    res,
    prisma,
    tenantId,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
