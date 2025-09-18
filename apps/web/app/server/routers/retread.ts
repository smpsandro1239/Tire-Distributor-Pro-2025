import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router, tenantProcedure } from '../trpc'

export const retreadRouter = router({
  // Create retread record
  create: tenantProcedure
    .input(z.object({
      tireId: z.string().uuid(),
      casingId: z.string().min(1),
      cycleNumber: z.number().min(1).max(10),
      grade: z.enum(['A', 'B', 'C', 'REJECTED']),
      processedBy: z.string().optional(),
      qualityScore: z.number().min(0).max(1).optional(),
      expectedKm: z.number().min(0).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if tire exists and belongs to tenant
      const tire = await ctx.prisma.tire.findFirst({
        where: {
          id: input.tireId,
          OR: [
            { tenantId: ctx.tenantId },
            { parentTenantId: ctx.tenantId }
          ]
        }
      })

      if (!tire) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tire not found'
        })
      }

      if (!tire.retreadable) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Tire is not retreadable'
        })
      }

      // Check if this cycle already exists
      const existingRetread = await ctx.prisma.retread.findUnique({
        where: {
          casingId_cycleNumber: {
            casingId: input.casingId,
            cycleNumber: input.cycleNumber,
          }
        }
      })

      if (existingRetread) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Retread cycle already exists'
        })
      }

      // Create retread record
      const retread = await ctx.prisma.retread.create({
        data: {
          ...input,
          processedAt: new Date(),
        },
        include: {
          tire: {
            include: {
              brand: true,
            }
          }
        }
      })

      // Update tire eco score based on retread grade
      const ecoScoreMultiplier = {
        'A': 0.95,
        'B': 0.85,
        'C': 0.75,
        'REJECTED': 0.0,
      }[input.grade]

      await ctx.prisma.tire.update({
        where: { id: input.tireId },
        data: {
          ecoScore: (tire.ecoScore || 1.0) * ecoScoreMultiplier,
        }
      })

      return retread
    }),

  // List retreads
  list: tenantProcedure
    .input(z.object({
      casingId: z.string().optional(),
      grade: z.enum(['A', 'B', 'C', 'REJECTED']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, casingId, grade } = input
      const skip = (page - 1) * limit

      const where: any = {}
      if (casingId) where.casingId = casingId
      if (grade) where.grade = grade

      // Filter by tenant's tires
      where.tire = {
        OR: [
          { tenantId: ctx.tenantId },
          { parentTenantId: ctx.tenantId }
        ]
      }

      const [retreads, total] = await Promise.all([
        ctx.prisma.retread.findMany({
          where,
          include: {
            tire: {
              include: {
                brand: true,
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.retread.count({ where })
      ])

      return {
        retreads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }),

  // Get retread history for a casing
  getCasingHistory: tenantProcedure
    .input(z.object({
      casingId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const retreads = await ctx.prisma.retread.findMany({
        where: {
          casingId: input.casingId,
          tire: {
            OR: [
              { tenantId: ctx.tenantId },
              { parentTenantId: ctx.tenantId }
            ]
          }
        },
        include: {
          tire: {
            include: {
              brand: true,
            }
          }
        },
        orderBy: { cycleNumber: 'asc' }
      })

      if (retreads.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Casing not found'
        })
      }

      // Calculate statistics
      const totalCycles = retreads.length
      const avgQualityScore = retreads
        .filter(r => r.qualityScore !== null)
        .reduce((sum, r) => sum + (r.qualityScore || 0), 0) / retreads.length

      const gradeDistribution = retreads.reduce((acc, r) => {
        acc[r.grade] = (acc[r.grade] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        casingId: input.casingId,
        retreads,
        statistics: {
          totalCycles,
          avgQualityScore: Math.round(avgQualityScore * 100) / 100,
          gradeDistribution,
          isRetreadable: totalCycles < (retreads[0]?.tire.maxRetreads || 3),
        }
      }
    }),

  // Generate QR code for casing
  generateQRCode: tenantProcedure
    .input(z.object({
      casingId: z.string(),
      tireId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify tire belongs to tenant
      const tire = await ctx.prisma.tire.findFirst({
        where: {
          id: input.tireId,
          OR: [
            { tenantId: ctx.tenantId },
            { parentTenantId: ctx.tenantId }
          ]
        }
      })

      if (!tire) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tire not found'
        })
      }

      // Generate QR code data
      const qrData = {
        casingId: input.casingId,
        tireId: input.tireId,
        sku: tire.sku,
        brand: tire.brandId,
        size: `${tire.width}/${tire.aspectRatio}R${tire.rimDiameter}`,
        maxRetreads: tire.maxRetreads,
        created: new Date().toISOString(),
      }

      // In a real implementation, you would generate an actual QR code image
      // For now, we'll return the data that would be encoded
      return {
        qrData: JSON.stringify(qrData),
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`,
        casingId: input.casingId,
      }
    }),

  // Scan QR code and get casing info
  scanQRCode: publicProcedure
    .input(z.object({
      qrData: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const data = JSON.parse(input.qrData)

        if (!data.casingId || !data.tireId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid QR code data'
          })
        }

        // Get casing history
        const retreads = await ctx.prisma.retread.findMany({
          where: { casingId: data.casingId },
          include: {
            tire: {
              include: {
                brand: true,
              }
            }
          },
          orderBy: { cycleNumber: 'desc' }
        })

        const tire = await ctx.prisma.tire.findUnique({
          where: { id: data.tireId },
          include: {
            brand: true,
            category: true,
          }
        })

        return {
          casingId: data.casingId,
          tire,
          retreads,
          isValid: true,
          scannedAt: new Date(),
        }
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid QR code format'
        })
      }
    }),

  // Get retread analytics
  getAnalytics: tenantProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { startDate, endDate } = input

      const where: any = {
        tire: {
          OR: [
            { tenantId: ctx.tenantId },
            { parentTenantId: ctx.tenantId }
          ]
        }
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const retreads = await ctx.prisma.retread.findMany({
        where,
        include: {
          tire: {
            include: {
              brand: true,
            }
          }
        }
      })

      // Calculate analytics
      const totalRetreads = retreads.length
      const gradeDistribution = retreads.reduce((acc, r) => {
        acc[r.grade] = (acc[r.grade] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const avgQualityScore = retreads
        .filter(r => r.qualityScore !== null)
        .reduce((sum, r) => sum + (r.qualityScore || 0), 0) / retreads.length

      const brandDistribution = retreads.reduce((acc, r) => {
        const brandName = r.tire.brand.name
        acc[brandName] = (acc[brandName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const cycleDistribution = retreads.reduce((acc, r) => {
        acc[r.cycleNumber] = (acc[r.cycleNumber] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      return {
        totalRetreads,
        gradeDistribution,
        avgQualityScore: Math.round(avgQualityScore * 100) / 100,
        brandDistribution,
        cycleDistribution,
        successRate: Math.round(((gradeDistribution.A || 0) + (gradeDistribution.B || 0)) / totalRetreads * 100),
      }
    }),
})
