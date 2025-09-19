import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router, tenantProcedure } from '../trpc'

export const tireRouter = router({
  // Get reseller catalog (public)
  getResellerCatalog: publicProcedure
    .input(z.object({
      resellerTenantId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      brandId: z.string().optional(),
      categoryId: z.string().optional(),
      vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'AGRICULTURAL', 'INDUSTRIAL']).optional(),
      season: z.enum(['SUMMER', 'WINTER', 'ALL_SEASON']).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'featured']).default('featured'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, search, brandId, categoryId, vehicleType, season, minPrice, maxPrice, sortBy, resellerTenantId } = input
      const skip = (page - 1) * limit

      // Get reseller to calculate final prices
      const reseller = await ctx.prisma.tenant.findUnique({
        where: { id: resellerTenantId, type: 'RESELLER', isActive: true }
      })

      if (!reseller) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reseller not found'
        })
      }

      const where: any = {
        parentTenantId: reseller.parentId,
        visible: true,
        stockQty: { gt: 0 },
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }

      if (brandId) where.brandId = brandId
      if (categoryId) where.categoryId = categoryId
      if (vehicleType) where.vehicleType = vehicleType
      if (season) where.season = season

      // Price filtering (considering reseller margin)
      if (minPrice || maxPrice) {
        const priceFilter: any = {}
        if (minPrice) priceFilter.gte = minPrice / (1 + reseller.margin)
        if (maxPrice) priceFilter.lte = maxPrice / (1 + reseller.margin)
        where.basePrice = priceFilter
      }

      // Sorting
      let orderBy: any = { featured: 'desc' }
      switch (sortBy) {
        case 'price_asc':
          orderBy = { basePrice: 'asc' }
          break
        case 'price_desc':
          orderBy = { basePrice: 'desc' }
          break
        case 'name_asc':
          orderBy = { name: 'asc' }
          break
        case 'name_desc':
          orderBy = { name: 'desc' }
          break
      }

      const [tires, total] = await Promise.all([
        ctx.prisma.tire.findMany({
          where,
          include: {
            brand: true,
            category: true,
          },
          skip,
          take: limit,
          orderBy,
        }),
        ctx.prisma.tire.count({ where }),
      ])

      // Calculate final prices with reseller margin
      const tiresWithFinalPrice = tires.map(tire => ({
        ...tire,
        finalPrice: Number(tire.basePrice) * (1 + Number(reseller.margin)),
      }))

      return {
        tires: tiresWithFinalPrice,
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      }
    }),

  // List tires for catalog (with tenant filtering)
  list: publicProcedure
    .input(z.object({
      tenantId: z.string().uuid().optional(),
      search: z.string().optional(),
      brandId: z.string().uuid().optional(),
      categoryId: z.string().uuid().optional(),
      vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'AGRICULTURAL', 'INDUSTRIAL']).optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      inStock: z.boolean().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, tenantId, search, brandId, categoryId, vehicleType, minPrice, maxPrice, inStock } = input
      const skip = (page - 1) * limit

      const where: any = {
        visible: true,
      }

      // Tenant filtering
      if (tenantId) {
        where.OR = [
          { tenantId },
          { parentTenantId: tenantId }
        ]
      }

      // Search
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }

      // Filters
      if (brandId) where.brandId = brandId
      if (categoryId) where.categoryId = categoryId
      if (vehicleType) where.vehicleType = vehicleType
      if (minPrice || maxPrice) {
        where.basePrice = {}
        if (minPrice) where.basePrice.gte = minPrice
        if (maxPrice) where.basePrice.lte = maxPrice
      }
      if (inStock) where.stockQty = { gt: 0 }

      const [tires, total] = await Promise.all([
        ctx.prisma.tire.findMany({
          where,
          include: {
            brand: true,
            category: true,
            inventory: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        ctx.prisma.tire.count({ where })
      ])

      return {
        tires,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    }),

  // Get single tire
  getById: publicProcedure
    .input(z.object({
      id: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      const tire = await ctx.prisma.tire.findUnique({
        where: { id: input.id },
        include: {
          brand: true,
          category: true,
          inventory: true,
          retreads: true,
        }
      })

      if (!tire) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tire not found'
        })
      }

      return tire
    }),

  // Create tire (distributor only)
  create: publicProcedure
    .input(z.object({
      sku: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      brandId: z.string().uuid(),
      categoryId: z.string().uuid(),
      width: z.number().min(100).max(500),
      aspectRatio: z.number().min(25).max(100),
      rimDiameter: z.number().min(10).max(30),
      loadIndex: z.string().optional(),
      speedRating: z.string().optional(),
      vehicleType: z.enum(['CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'AGRICULTURAL', 'INDUSTRIAL']),
      season: z.string().default('ALL_SEASON'),
      basePrice: z.number().min(0),
      stockQty: z.number().min(0).default(0),
      minStock: z.number().min(0).default(5),
      maxStock: z.number().min(0).default(100),
      retreadable: z.boolean().default(true),
      maxRetreads: z.number().min(0).max(10).default(3),
      warrantyMonths: z.number().min(0).max(120).default(24),
      images: z.array(z.string().url()).default([]),
      tenantId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if SKU already exists
      const existingTire = await ctx.prisma.tire.findUnique({
        where: { sku: input.sku }
      })

      if (existingTire) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'SKU already exists'
        })
      }

      const tire = await ctx.prisma.tire.create({
        data: {
          ...input,
          parentTenantId: input.tenantId,
          casingId: input.retreadable ? `CASING-${input.sku}-${Date.now()}` : null,
        },
        include: {
          brand: true,
          category: true,
        }
      })

      // Create initial inventory record
      await ctx.prisma.inventory.create({
        data: {
          tenantId: input.tenantId,
          tireId: tire.id,
          quantity: input.stockQty,
          available: input.stockQty,
        }
      })

      // Publish stock event to Kafka
      // TODO: Implement Kafka producer

      return tire
    }),

  // Update tire visibility and margin for child tenant
  updateVisibility: tenantProcedure
    .input(z.object({
      tireId: z.string().uuid(),
      visible: z.boolean(),
      margin: z.number().min(0).max(0.5).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { tireId, visible, margin } = input

      // Check if tire belongs to parent or current tenant
      const tire = await ctx.prisma.tire.findFirst({
        where: {
          id: tireId,
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

      const updateData: any = { visible }
      if (margin !== undefined) updateData.margin = margin

      return ctx.prisma.tire.update({
        where: { id: tireId },
        data: updateData
      })
    }),

  // Sync stock from parent to children
  syncStock: publicProcedure
    .input(z.object({
      parentTenantId: z.string().uuid(),
      tireId: z.string().uuid(),
      newQuantity: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const { parentTenantId, tireId, newQuantity } = input

      // Update parent inventory
      await ctx.prisma.inventory.updateMany({
        where: {
          tenantId: parentTenantId,
          tireId,
        },
        data: {
          quantity: newQuantity,
          available: newQuantity,
        }
      })

      // Get all child tenants
      const childTenants = await ctx.prisma.tenant.findMany({
        where: { parentId: parentTenantId }
      })

      // Update child inventories (they mirror parent stock)
      for (const child of childTenants) {
        await ctx.prisma.inventory.upsert({
          where: {
            tenantId_tireId: {
              tenantId: child.id,
              tireId,
            }
          },
          create: {
            tenantId: child.id,
            tireId,
            quantity: newQuantity,
            available: newQuantity,
          },
          update: {
            quantity: newQuantity,
            available: newQuantity,
          }
        })
      }

      // Publish stock sync event to Kafka
      // TODO: Implement Kafka producer

      return { success: true }
    }),
})
