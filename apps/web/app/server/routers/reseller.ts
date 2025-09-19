import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router, tenantProcedure } from '../trpc'

export const resellerRouter = router({
  // Create new reseller (distributor only)
  create: tenantProcedure
    .input(z.object({
      subdomain: z.string().min(2).max(20).regex(/^[a-z0-9-]+$/),
      businessName: z.string().min(1).max(100),
      contactName: z.string().min(1).max(100),
      email: z.string().email(),
      phone: z.string().min(9).max(20),
      address: z.string().min(10).max(200),
      city: z.string().min(2).max(50),
      postalCode: z.string().min(4).max(10),
      country: z.string().default('PT'),
      // Branding
      logo: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#1F2937'),
      // Business settings
      defaultMargin: z.number().min(0).max(1).default(0.20), // 20%
      currency: z.string().default('EUR'),
      language: z.string().default('pt'),
      // Contract terms
      contractType: z.enum(['COMMISSION', 'WHOLESALE', 'DROPSHIP']).default('COMMISSION'),
      commissionRate: z.number().min(0).max(0.5).optional(),
      creditLimit: z.number().min(0).default(5000),
      paymentTerms: z.number().default(30), // days
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if subdomain already exists
      const existingReseller = await ctx.prisma.tenant.findUnique({
        where: { slug: input.subdomain }
      })

      if (existingReseller) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Subdomain already exists'
        })
      }

      // Create Stripe Connect account for reseller
      // TODO: Implement Stripe Connect account creation

      // Create reseller tenant
      const reseller = await ctx.prisma.tenant.create({
        data: {
          slug: input.subdomain,
          name: input.businessName,
          type: 'RESELLER',
          parentId: ctx.tenantId,
          email: input.email,
          phone: input.phone,
          address: input.address,
          city: input.city,
          country: input.country,
          logo: input.logo,
          primaryColor: input.primaryColor,
          margin: input.defaultMargin,
          // stripeAcctId: stripeAccount.id, // TODO: Add when Stripe is implemented
        }
      })

      // Create default user for reseller
      await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.contactName,
          role: 'ADMIN',
          tenantId: reseller.id,
        }
      })

      // Copy parent's tire catalog to reseller (initially all visible)
      const parentTires = await ctx.prisma.tire.findMany({
        where: { tenantId: ctx.tenantId }
      })

      for (const tire of parentTires) {
        await ctx.prisma.tire.create({
          data: {
            ...tire,
            id: undefined, // Let Prisma generate new ID
            tenantId: reseller.id,
            parentTenantId: ctx.tenantId,
            visible: true,
            margin: input.defaultMargin,
          }
        })
      }

      // TODO: Create Vercel subdomain deployment
      // await createVercelSubdomain(input.subdomain)

      return reseller
    }),

  // List resellers (distributor only)
  list: tenantProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search, status } = input
      const skip = (page - 1) * limit

      const where: any = {
        parentId: ctx.tenantId,
        type: 'RESELLER',
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (status) {
        where.isActive = status === 'ACTIVE'
      }

      const [resellers, total] = await Promise.all([
        ctx.prisma.tenant.findMany({
          where,
          include: {
            users: {
              where: { role: 'ADMIN' },
              take: 1
            },
            _count: {
              select: {
                orders: true,
                tires: { where: { visible: true } }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.tenant.count({ where })
      ])

      return {
        resellers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }),

  // Get reseller by subdomain (public)
  getBySubdomain: publicProcedure
    .input(z.object({
      subdomain: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const reseller = await ctx.prisma.tenant.findUnique({
        where: {
          subdomain: input.subdomain,
          type: 'RESELLER',
          isActive: true
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      return reseller
    }),

  // Get reseller by custom domain (public)
  getByCustomDomain: publicProcedure
    .input(z.object({
      domain: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const reseller = await ctx.prisma.tenant.findUnique({
        where: {
          customDomain: input.domain,
          type: 'RESELLER',
          isActive: true
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      return reseller
    }),

  // Update reseller settings
  update: tenantProcedure
    .input(z.object({
      resellerId: z.string().uuid(),
      businessName: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(9).max(20).optional(),
      address: z.string().min(10).max(200).optional(),
      city: z.string().min(2).max(50).optional(),
      logo: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      defaultMargin: z.number().min(0).max(1).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { resellerId, ...updateData } = input

      // Verify reseller belongs to current tenant
      const reseller = await ctx.prisma.tenant.findFirst({
        where: {
          id: resellerId,
          parentId: ctx.tenantId,
          type: 'RESELLER'
        }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      return ctx.prisma.tenant.update({
        where: { id: resellerId },
        data: {
          name: updateData.businessName,
          email: updateData.email,
          phone: updateData.phone,
          address: updateData.address,
          city: updateData.city,
          logo: updateData.logo,
          primaryColor: updateData.primaryColor,
          margin: updateData.defaultMargin,
          isActive: updateData.isActive,
        }
      })
    }),

  // Get reseller analytics
  getAnalytics: tenantProcedure
    .input(z.object({
      resellerId: z.string().uuid(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { resellerId, startDate, endDate } = input

      // Verify reseller belongs to current tenant
      const reseller = await ctx.prisma.tenant.findFirst({
        where: {
          id: resellerId,
          parentId: ctx.tenantId,
          type: 'RESELLER'
        }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      } : {}

      // Get analytics data
      const [orders, totalRevenue, topTires] = await Promise.all([
        ctx.prisma.order.findMany({
          where: {
            tenantId: resellerId,
            ...dateFilter
          },
          include: {
            items: {
              include: {
                tire: true
              }
            }
          }
        }),
        ctx.prisma.order.aggregate({
          where: {
            tenantId: resellerId,
            status: 'DELIVERED',
            ...dateFilter
          },
          _sum: {
            total: true
          }
        }),
        ctx.prisma.orderItem.groupBy({
          by: ['tireId'],
          where: {
            order: {
              tenantId: resellerId,
              ...dateFilter
            }
          },
          _sum: {
            quantity: true,
            totalPrice: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 5
        })
      ])

      return {
        totalOrders: orders.length,
        totalRevenue: totalRevenue._sum.total || 0,
        avgOrderValue: orders.length > 0 ? (totalRevenue._sum.total || 0) / orders.length : 0,
        topTires,
        recentOrders: orders.slice(0, 10),
      }
    }),

  // Toggle tire visibility for reseller
  toggleTireVisibility: tenantProcedure
    .input(z.object({
      resellerId: z.string().uuid(),
      tireId: z.string().uuid(),
      visible: z.boolean(),
      customMargin: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { resellerId, tireId, visible, customMargin } = input

      // Verify reseller belongs to current tenant
      const reseller = await ctx.prisma.tenant.findFirst({
        where: {
          id: resellerId,
          parentId: ctx.tenantId,
          type: 'RESELLER'
        }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      // Update tire visibility and margin
      return ctx.prisma.tire.updateMany({
        where: {
          id: tireId,
          tenantId: resellerId,
          parentTenantId: ctx.tenantId
        },
        data: {
          visible,
          margin: customMargin || reseller.margin
        }
      })
    }),

  // Sync stock from parent to reseller
  syncStock: tenantProcedure
    .input(z.object({
      resellerId: z.string().uuid(),
      tireId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { resellerId, tireId } = input

      // Get parent tire stock
      const parentTire = await ctx.prisma.tire.findFirst({
        where: {
          id: tireId,
          tenantId: ctx.tenantId
        }
      })

      if (!parentTire) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent tire not found'
        })
      }

      // Update reseller tire stock
      await ctx.prisma.tire.updateMany({
        where: {
          parentTenantId: ctx.tenantId,
          tenantId: resellerId,
          sku: parentTire.sku // Match by SKU since reseller has different ID
        },
        data: {
          stockQty: parentTire.stockQty,
        }
      })

      // TODO: Publish stock sync event to Kafka
      // await kafka.send('stock-sync', { resellerId, tireId, newStock: parentTire.stockQty })

      return { success: true, newStock: parentTire.stockQty }
    }),
})
