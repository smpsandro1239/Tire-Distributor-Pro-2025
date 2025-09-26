import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

// Middleware for tenant isolation
const tenantMiddleware = t.middleware(({ ctx, next }) => {
  // Allow development without tenant for localhost
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isLocalhost = ctx.req.headers.host?.includes('localhost') || ctx.req.headers.host?.includes('127.0.0.1')

  if (!ctx.tenantId && !isDevelopment && !isLocalhost) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Tenant not found',
    })
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.tenantId,
    },
  })
})

export const tenantProcedure = publicProcedure.use(tenantMiddleware)
