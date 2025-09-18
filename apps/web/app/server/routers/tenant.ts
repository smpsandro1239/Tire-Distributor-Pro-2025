import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const tenantRouter = router({
  // Create new child tenant (reseller)
  create: publicProcedure
    .input(z.object({
      slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
      name: z.string().min(2).max(100),
      email: z.string().email(),
      margin: z.number().min(0).max(0.5).default(0.18),
      parentId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if parent tenant exists
      const parentTenant = await ctx.prisma.tenant.findUnique({
        where: { id: input.parentId }
      })

      if (!parentTenant || parentTenant.type !== 'DISTRIBUTOR') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent distributor not found'
        })
      }

      // Check if slug is available
      const existingTenant = await ctx.prisma.tenant.findUnique({
        where: { slug: input.slug }
      })

      if (existingTenant) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Slug already taken'
        })
      }

      // Create Stripe Connect account
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'PT',
        email: input.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })

      // Create tenant
      const tenant = await ctx.prisma.tenant.create({
        data: {
          slug: input.slug,
          name: input.name,
          email: input.email,
          type: 'RESELLER',
          parentId: input.parentId,
          margin: input.margin,
          stripeAcctId: account.id,
        }
      })

      // Create Vercel subdomain (if in production)
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL_TOKEN) {
        try {
          await fetch(`https://api.vercel.com/v8/projects/${process.env.VERCEL_PROJECT}/domains`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: `${input.slug}.tiredist.com`
            })
          })
        } catch (error) {
          console.error('Failed to create Vercel domain:', error)
        }
      }

      // Publish tenant creation event to Kafka
      // TODO: Implement Kafka producer

      return tenant
    }),

  // Get tenant by slug
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { slug: input.slug },
        include: {
          parent: true,
          children: true,
        }
      })

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found'
        })
      }

      return tenant
    }),

  // List child tenants
  listChildren: publicProcedure
    .input(z.object({
      parentId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.tenant.findMany({
        where: { parentId: input.parentId },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // Update tenant settings
  update: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      margin: z.number().min(0).max(0.5).optional(),
      logo: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      return ctx.prisma.tenant.update({
        where: { id },
        data: updateData
      })
    }),
})
