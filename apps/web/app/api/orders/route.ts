import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const resellerId = searchParams.get('resellerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (resellerId) {
      where.resellerId = resellerId;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              tire: true,
            },
          },
          tenant: {
            select: {
              name: true,
              subdomain: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.order.count({ where }),
    ]);

    // Transform data for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      customerEmail: order.customerEmail,
      tenantId: order.tenantId,
      tenantName: order.tenant?.name || 'N/A',
      totalAmount: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        tireId: item.tireId,
        tireBrand: item.tire.name,
        tireModel: item.tire.name,
        tireSize: `${item.tire.width}/${item.tire.aspectRatio}R${item.tire.rimDiameter}`,
        quantity: item.quantity,
        price: Number(item.unitPrice),
      })),
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const order = await db.order.create({
      data: {
        customerEmail: data.customerEmail,
        tenantId: data.tenantId,
        total: data.totalAmount,
        status: 'PENDING',
        items: {
          create: data.items.map((item: any) => ({
            tireId: item.tireId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            tire: true,
          },
        },
        tenant: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}
