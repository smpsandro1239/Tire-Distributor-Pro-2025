import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../packages/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Find reseller
    const reseller = await db.tenant.findUnique({
      where: { subdomain: params.subdomain },
    });

    if (!reseller) {
      return NextResponse.json(
        { error: 'Revendedor não encontrado' },
        { status: 404 }
      );
    }

    // Get orders in date range
    const orders = await db.order.findMany({
      where: {
        tenantId: reseller.id,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            tire: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;

    // Top selling tires
    const tireStats = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.tireId;
        if (!tireStats.has(key)) {
          tireStats.set(key, {
            id: item.tire.id,
            name: `${item.tire.name}`,
            brand: item.tire.brand?.name || 'N/A',
            model: item.tire.name,
            totalSold: 0,
            revenue: 0,
          });
        }
        const stats = tireStats.get(key);
        stats.totalSold += item.quantity;
        stats.revenue += Number(item.totalPrice);
      });
    });

    const topSellingTires = Array.from(tireStats.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        customerEmail: order.customerEmail,
        totalAmount: Number(order.total),
        status: order.status.toLowerCase(),
        createdAt: order.createdAt.toISOString(),
      }));

    // Monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthOrders = orders.filter(order =>
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );

      monthlyStats.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + Number(order.total), 0),
      });
    }

    const dashboardStats = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      topSellingTires,
      recentOrders,
      monthlyStats,
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
