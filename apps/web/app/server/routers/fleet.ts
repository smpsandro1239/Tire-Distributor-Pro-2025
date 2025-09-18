import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../trpc'

export const fleetRouter = router({
  // Create fleet
  create: tenantProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['LOGISTICS', 'EMERGENCY', 'CONSTRUCTION', 'AGRICULTURE', 'MUNICIPAL']),
      managerName: z.string().optional(),
      managerEmail: z.string().email().optional(),
      managerPhone: z.string().optional(),
      contractType: z.enum(['KM_BASED', 'TIME_BASED', 'PERFORMANCE']).optional(),
      contractStart: z.date().optional(),
      contractEnd: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.fleet.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        }
      })
    }),

  // List fleets
  list: tenantProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit } = input
      const skip = (page - 1) * limit

      const [fleets, total] = await Promise.all([
        ctx.prisma.fleet.findMany({
          where: { tenantId: ctx.tenantId },
          include: {
            vehicles: {
              include: {
                sensors: true,
              }
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.fleet.count({
          where: { tenantId: ctx.tenantId }
        })
      ])

      return {
        fleets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }),

  // Get fleet details
  getById: tenantProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      const fleet = await ctx.prisma.fleet.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          vehicles: {
            include: {
              sensors: {
                orderBy: { lastReading: 'desc' }
              }
            }
          }
        }
      })

      if (!fleet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fleet not found'
        })
      }

      return fleet
    }),

  // Add vehicle to fleet
  addVehicle: tenantProcedure
    .input(z.object({
      fleetId: z.string().uuid(),
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.number().min(1900).max(new Date().getFullYear() + 1),
      vin: z.string().optional(),
      licensePlate: z.string().min(1),
      type: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'AGRICULTURAL', 'INDUSTRIAL']),
      frontTireSize: z.string().optional(),
      rearTireSize: z.string().optional(),
      tireCount: z.number().min(2).max(18).default(4),
      currentKm: z.number().min(0).default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const { fleetId, ...vehicleData } = input

      // Verify fleet belongs to tenant
      const fleet = await ctx.prisma.fleet.findFirst({
        where: {
          id: fleetId,
          tenantId: ctx.tenantId,
        }
      })

      if (!fleet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fleet not found'
        })
      }

      return ctx.prisma.vehicle.create({
        data: {
          ...vehicleData,
          fleetId,
        }
      })
    }),

  // Get fleet analytics
  getAnalytics: tenantProcedure
    .input(z.object({
      fleetId: z.string().uuid(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { fleetId, startDate, endDate } = input

      // Verify fleet belongs to tenant
      const fleet = await ctx.prisma.fleet.findFirst({
        where: {
          id: fleetId,
          tenantId: ctx.tenantId,
        },
        include: {
          vehicles: {
            include: {
              sensors: true,
            }
          }
        }
      })

      if (!fleet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fleet not found'
        })
      }

      // Calculate analytics
      const totalVehicles = fleet.vehicles.length
      const activeSensors = fleet.vehicles.reduce((acc, vehicle) =>
        acc + vehicle.sensors.filter(s => s.isActive).length, 0
      )

      const lowPressureAlerts = fleet.vehicles.reduce((acc, vehicle) =>
        acc + vehicle.sensors.filter(s => s.pressure && s.pressure < 6.0).length, 0
      )

      const avgPressure = fleet.vehicles.reduce((acc, vehicle) => {
        const validSensors = vehicle.sensors.filter(s => s.pressure !== null)
        const vehicleAvg = validSensors.length > 0
          ? validSensors.reduce((sum, s) => sum + (s.pressure || 0), 0) / validSensors.length
          : 0
        return acc + vehicleAvg
      }, 0) / (totalVehicles || 1)

      return {
        totalVehicles,
        activeSensors,
        lowPressureAlerts,
        avgPressure: Math.round(avgPressure * 100) / 100,
        fleet,
      }
    }),

  // Schedule tire change
  scheduleTireChange: tenantProcedure
    .input(z.object({
      vehicleId: z.string().uuid(),
      scheduledDate: z.date(),
      reason: z.enum(['WEAR', 'DAMAGE', 'SEASONAL', 'PREVENTIVE']),
      notes: z.string().optional(),
      tirePositions: z.array(z.enum(['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'])),
    }))
    .mutation(async ({ input, ctx }) => {
      // This would create a maintenance schedule record
      // For now, we'll just return success
      return {
        success: true,
        scheduledDate: input.scheduledDate,
        vehicleId: input.vehicleId,
      }
    }),
})
