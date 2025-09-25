import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reseller = searchParams.get('reseller');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    if (reseller) {
      // Filter by reseller's available tires
      where.tenantId = reseller;
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (size) {
      where.size = { contains: size, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Only show tires with stock
    where.stockQty = { gt: 0 };

    const [tires, total] = await Promise.all([
      db.tire.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
        },
      }),
      db.tire.count({ where }),
    ]);

    return NextResponse.json({
      tires,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tires:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pneus' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const tire = await db.tire.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        parentTenantId: data.parentTenantId,
        tenantId: data.tenantId,
        brandId: data.brandId,
        categoryId: data.categoryId,
        width: data.width,
        aspectRatio: data.aspectRatio,
        rimDiameter: data.rimDiameter,
        basePrice: parseFloat(data.basePrice),
        stockQty: parseInt(data.stockQty),
        images: data.images || [],
      },
    });

    return NextResponse.json(tire, { status: 201 });
  } catch (error) {
    console.error('Error creating tire:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pneu' },
      { status: 500 }
    );
  }
}
