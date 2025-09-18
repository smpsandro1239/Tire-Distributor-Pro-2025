import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router, tenantProcedure } from '../trpc'

export const sensorRouter = router({
  // List sensors for a fleet or vehicle
  list: tenantProcedure
    .input(z.object({
      vehicleId: z.string().uuid().optional(),
      fleetId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
      position: z.enum(['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, vehicleId, fleetId, isActive, position } = input
      const skip = (page - 1) * limit

      const where: any = {}

      // Filter by vehicle
      if (vehicleId) {
        where.vehicleId = vehicleId
      }

      // Filter by fleet (through vehicle)
      if (fleetId) {
        where.vehicle = {
          fleetId,
          fleet: {
            tenantId: ctx.tenantId
          }
        }
      } else {
        // Ensure tenant isolation
        where.vehicle = {
          fleet: {
            tenantId: ctx.tenantId
          }
        }
      }

      // Additional filters
      if (isActive !== undefined) where.isActive = isActive
      if (position) where.position = position

      const [sensors, total] = await Promise.all([
        ctx.prisma.tireSensor.findMany({
          where,
          include: {
            vehicle: {
              include: {
                fleet: true
              }
            },
            tire: true,
          },
          skip,
          take: limit,
          orderBy: { lastReading: 'desc' }
        }),
        ctx.prisma.tireSensor.count({ where })
      ])

      return {
        sensors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }),

  // Get sensor by ID
  getById: tenantProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      const sensor = await ctx.prisma.tireSensor.findFirst({
        where: {
          id: input.id,
          vehicle: {
            fleet: {
              tenantId: ctx.tenantId
            }
          }
        },
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found'
        })
      }

      return sensor
    }),

  // Create new sensor
  create: tenantProcedure
    .input(z.object({
      sensorId: z.string().min(1), // physical sensor ID
      vehicleId: z.string().uuid(),
      position: z.enum(['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT']),
      tireId: z.string().uuid().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify vehicle belongs to tenant
      const vehicle = await ctx.prisma.vehicle.findFirst({
        where: {
          id: input.vehicleId,
          fleet: {
            tenantId: ctx.tenantId
          }
        }
      })

      if (!vehicle) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vehicle not found'
        })
      }

      // Check if sensor ID already exists
      const existingSensor = await ctx.prisma.tireSensor.findUnique({
        where: { sensorId: input.sensorId }
      })

      if (existingSensor) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Sensor ID already exists'
        })
      }

      // Check if position is already occupied
      const positionTaken = await ctx.prisma.tireSensor.findFirst({
        where: {
          vehicleId: input.vehicleId,
          position: input.position,
          isActive: true
        }
      })

      if (positionTaken) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Position already occupied by another sensor'
        })
      }

      return ctx.prisma.tireSensor.create({
        data: input,
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })
    }),

  // Update sensor readings (typically called by IoT devices)
  updateReadings: publicProcedure
    .input(z.object({
      sensorId: z.string(),
      pressure: z.number().min(0).max(15).optional(), // bar
      temperature: z.number().min(-50).max(150).optional(), // celsius
      batteryLevel: z.number().min(0).max(100).optional(), // percentage
    }))
    .mutation(async ({ input, ctx }) => {
      const { sensorId, pressure, temperature, batteryLevel } = input

      const sensor = await ctx.prisma.tireSensor.findUnique({
        where: { sensorId }
      })

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found'
        })
      }

      const updateData: any = {
        lastReading: new Date(),
      }

      if (pressure !== undefined) updateData.pressure = pressure
      if (temperature !== undefined) updateData.temperature = temperature
      if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel

      const updatedSensor = await ctx.prisma.tireSensor.update({
        where: { sensorId },
        data: updateData,
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })

      // TODO: Publish sensor data to Kafka for real-time processing
      // TODO: Check for alerts (low pressure, high temperature, low battery)

      return updatedSensor
    }),

  // Assign tire to sensor
  assignTire: tenantProcedure
    .input(z.object({
      sensorId: z.string().uuid(),
      tireId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify sensor belongs to tenant
      const sensor = await ctx.prisma.tireSensor.findFirst({
        where: {
          id: input.sensorId,
          vehicle: {
            fleet: {
              tenantId: ctx.tenantId
            }
          }
        }
      })

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found'
        })
      }

      return ctx.prisma.tireSensor.update({
        where: { id: input.sensorId },
        data: { tireId: input.tireId },
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })
    }),

  // Get sensor alerts
  getAlerts: tenantProcedure
    .input(z.object({
      vehicleId: z.string().uuid().optional(),
      fleetId: z.string().uuid().optional(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { vehicleId, fleetId, severity } = input

      const where: any = {
        vehicle: {
          fleet: {
            tenantId: ctx.tenantId
          }
        },
        isActive: true,
      }

      if (vehicleId) where.vehicleId = vehicleId
      if (fleetId) where.vehicle.fleetId = fleetId

      const sensors = await ctx.prisma.tireSensor.findMany({
        where,
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })

      // Generate alerts based on sensor readings
      const alerts = sensors.flatMap(sensor => {
        const sensorAlerts: Array<{
          id: string
          sensorId: string
          sensor: any
          type: string
          severity: 'LOW' | 'MEDIUM' | 'HIGH'
          message: string
          value: number | null
          threshold: number | null
          timestamp: Date | null
        }> = []

        // Low pressure alert (< 6.0 bar)
        if (sensor.pressure && sensor.pressure < 6.0) {
          sensorAlerts.push({
            id: `${sensor.id}-pressure`,
            sensorId: sensor.id,
            sensor,
            type: 'LOW_PRESSURE',
            severity: sensor.pressure < 4.0 ? 'HIGH' : 'MEDIUM',
            message: `Low tire pressure: ${sensor.pressure} bar`,
            value: sensor.pressure,
            threshold: 6.0,
            timestamp: sensor.lastReading,
          })
        }

        // High temperature alert (> 80°C)
        if (sensor.temperature && sensor.temperature > 80) {
          sensorAlerts.push({
            id: `${sensor.id}-temperature`,
            sensorId: sensor.id,
            sensor,
            type: 'HIGH_TEMPERATURE',
            severity: sensor.temperature > 100 ? 'HIGH' : 'MEDIUM',
            message: `High tire temperature: ${sensor.temperature}°C`,
            value: sensor.temperature,
            threshold: 80,
            timestamp: sensor.lastReading,
          })
        }

        // Low battery alert (< 20%)
        if (sensor.batteryLevel && sensor.batteryLevel < 20) {
          sensorAlerts.push({
            id: `${sensor.id}-battery`,
            sensorId: sensor.id,
            sensor,
            type: 'LOW_BATTERY',
            severity: sensor.batteryLevel < 10 ? 'HIGH' : 'LOW',
            message: `Low sensor battery: ${sensor.batteryLevel}%`,
            value: sensor.batteryLevel,
            threshold: 20,
            timestamp: sensor.lastReading,
          })
        }

        // No recent readings alert (> 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        if (!sensor.lastReading || sensor.lastReading < oneHourAgo) {
          sensorAlerts.push({
            id: `${sensor.id}-offline`,
            sensorId: sensor.id,
            sensor,
            type: 'SENSOR_OFFLINE',
            severity: 'MEDIUM',
            message: 'Sensor not responding',
            value: null,
            threshold: null,
            timestamp: sensor.lastReading,
          })
        }

        return sensorAlerts
      })

      // Filter by severity if specified
      const filteredAlerts = severity
        ? alerts.filter(alert => alert.severity === severity)
        : alerts

      return {
        alerts: filteredAlerts,
        summary: {
          total: filteredAlerts.length,
          high: filteredAlerts.filter(a => a.severity === 'HIGH').length,
          medium: filteredAlerts.filter(a => a.severity === 'MEDIUM').length,
          low: filteredAlerts.filter(a => a.severity === 'LOW').length,
        }
      }
    }),

  // Deactivate sensor
  deactivate: tenantProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify sensor belongs to tenant
      const sensor = await ctx.prisma.tireSensor.findFirst({
        where: {
          id: input.id,
          vehicle: {
            fleet: {
              tenantId: ctx.tenantId
            }
          }
        }
      })

      if (!sensor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sensor not found'
        })
      }

      return ctx.prisma.tireSensor.update({
        where: { id: input.id },
        data: { isActive: false },
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })
    }),

  // Get sensor analytics
  getAnalytics: tenantProcedure
    .input(z.object({
      vehicleId: z.string().uuid().optional(),
      fleetId: z.string().uuid().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { vehicleId, fleetId, startDate, endDate } = input

      const where: any = {
        vehicle: {
          fleet: {
            tenantId: ctx.tenantId
          }
        },
        isActive: true,
      }

      if (vehicleId) where.vehicleId = vehicleId
      if (fleetId) where.vehicle.fleetId = fleetId

      const sensors = await ctx.prisma.tireSensor.findMany({
        where,
        include: {
          vehicle: {
            include: {
              fleet: true
            }
          },
          tire: true,
        }
      })

      // Calculate analytics
      const totalSensors = sensors.length
      const activeSensors = sensors.filter(s => s.isActive).length
      const sensorsWithRecentData = sensors.filter(s => {
        if (!s.lastReading) return false
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return s.lastReading > oneHourAgo
      }).length

      const avgPressure = sensors.reduce((acc, s) => {
        return acc + (s.pressure || 0)
      }, 0) / (totalSensors || 1)

      const avgTemperature = sensors.reduce((acc, s) => {
        return acc + (s.temperature || 0)
      }, 0) / (totalSensors || 1)

      const avgBatteryLevel = sensors.reduce((acc, s) => {
        return acc + (s.batteryLevel || 0)
      }, 0) / (totalSensors || 1)

      return {
        totalSensors,
        activeSensors,
        sensorsWithRecentData,
        offlineSensors: totalSensors - sensorsWithRecentData,
        avgPressure: Math.round(avgPressure * 100) / 100,
        avgTemperature: Math.round(avgTemperature * 100) / 100,
        avgBatteryLevel: Math.round(avgBatteryLevel * 100) / 100,
        sensors,
      }
    }),
})
