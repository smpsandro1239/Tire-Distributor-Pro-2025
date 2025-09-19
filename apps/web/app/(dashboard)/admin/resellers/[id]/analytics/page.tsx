'use client'

import {
    ChartBarIcon,
    CurrencyEuroIcon,
    ShoppingCartIcon,
    TrendingDownIcon,
    TrendingUpIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { LoadingSpinner } from '../../../../../../../packages/ui/src/components/LoadingSpinner'
import { api } from '../../../../../server/api'

type Period = '7d' | '30d' | '90d' | '1y'

export default function ResellerAnalyticsPage() {
  const params = useParams()
  const resellerId = params.id as string
  const [period, setPeriod] = useState<Period>('30d')

  const { data: analytics, isLoading } = api.reseller.analytics.useQuery({
    resellerId,
    period,
  })

  const { data: reseller } = api.reseller.list.useQuery({
    search: resellerId,
    limit: 1,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const resellerData = reseller?.resellers[0]

  const periodLabels = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '1y': 'Último ano',
  }

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics - {resellerData?.brandName || resellerData?.name}
          </h1>
          <p className="text-gray-600">
            Métricas de desempenho e vendas do revendedor
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalOrders || 0}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes Únicos</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.uniqueCustomers || 0}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(analytics?.conversionRate || 0)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Receita Diária
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Gráfico de receita por dia
              </p>
              <p className="text-xs text-gray-400">
                (Integração com Chart.js em desenvolvimento)
              </p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pedidos por Dia
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Gráfico de pedidos por dia
              </p>
              <p className="text-xs text-gray-400">
                (Integração com Chart.js em desenvolvimento)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Produtos Mais Vendidos
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                    {i}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Michelin Primacy 4
                    </p>
                    <p className="text-xs text-gray-500">205/55R16</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">24 vendas</p>
                  <p className="text-xs text-gray-500">€2,880</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Segmentos de Clientes
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Novos Clientes</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clientes Recorrentes</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Métricas de Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor Médio do Pedido</span>
              <span className="text-sm font-medium">
                {formatCurrency(analytics?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Produtos no Catálogo</span>
              <span className="text-sm font-medium">
                {analytics?.totalTires || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de Abandono</span>
              <span className="text-sm font-medium">23.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo Médio no Site</span>
              <span className="text-sm font-medium">4m 32s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Stats Table */}
      {analytics?.dailyStats && analytics.dailyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Estatísticas Diárias
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Médio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.dailyStats.map((day) => (
                  <tr key={day.date}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(day.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.orders > 0 ? formatCurrency(day.revenue / day.orders) : '€0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
