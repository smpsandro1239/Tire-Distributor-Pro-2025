'use client';

import { Button } from '@repo/ui/components/Button';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  topSellingTires: Array<{
    id: string;
    name: string;
    brand: string;
    model: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

interface DashboardPageProps {
  params: { subdomain: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchDashboardStats();
  }, [params.subdomain, timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resellers/${params.subdomain}/dashboard?range=${timeRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Erro ao carregar dados</h2>
          <p className="text-gray-600">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard do Revendedor
          </h1>
          <p className="text-gray-600">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </Button>
          <Button
            variant={timeRange === '30d' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </Button>
          <Button
            variant={timeRange === '90d' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('90d')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <div className="w-8 h-8 text-blue-600 text-2xl">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="w-8 h-8 text-green-600 text-2xl">💰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="w-8 h-8 text-yellow-600 text-2xl">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <div className="w-8 h-8 text-purple-600 text-2xl">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos Completos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Tires */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pneus Mais Vendidos
          </h2>
          <div className="space-y-4">
            {stats.topSellingTires.map((tire, index) => (
              <div key={tire.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {tire.brand} {tire.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tire.totalSold} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {tire.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pedidos Recentes
          </h2>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customerEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {order.totalAmount.toLocaleString()}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Performance Mensal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.monthlyStats.map((month) => (
            <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {month.month}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {month.orders}
              </p>
              <p className="text-xs text-gray-500">pedidos</p>
              <p className="text-sm font-semibold text-green-600 mt-2">
                R$ {month.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="p-4 h-auto flex flex-col items-center"
            onClick={() => window.location.href = `/reseller/${params.subdomain}/orders`}
          >
            <div className="text-2xl mb-2">📋</div>
            <span>Ver Todos os Pedidos</span>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto flex flex-col items-center"
            onClick={() => window.location.href = `/reseller/${params.subdomain}/catalog`}
          >
            <div className="text-2xl mb-2">🛒</div>
            <span>Gerenciar Catálogo</span>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto flex flex-col items-center"
            onClick={() => window.location.href = `/reseller/${params.subdomain}/analytics`}
          >
            <div className="text-2xl mb-2">📊</div>
            <span>Ver Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
