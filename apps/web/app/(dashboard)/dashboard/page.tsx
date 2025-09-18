'use client'

import { Card, CardContent, CardHeader } from '@tire-distributor/ui'

export default function DashboardPage() {
  // Mock data - em produção viria do tRPC
  const stats = {
    totalTires: 1250,
    totalOrders: 89,
    totalRevenue: 45670,
    lowStockItems: 23,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pneus</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTires}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encomendas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Baixo</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendas Recentes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Vendas Recentes</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: '001', customer: 'Oficina Silva', amount: 450, status: 'Pago' },
                { id: '002', customer: 'AutoPneus Lda', amount: 1200, status: 'Pendente' },
                { id: '003', customer: 'Frota Express', amount: 890, status: 'Pago' },
                { id: '004', customer: 'Transportes Norte', amount: 2100, status: 'Enviado' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{order.customer}</p>
                    <p className="text-sm text-gray-600">#{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Pago' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Stock */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Alertas de Stock</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { sku: 'MICH-205-55-16', name: 'Michelin Energy Saver', stock: 3, min: 10 },
                { sku: 'CONT-225-45-17', name: 'Continental PremiumContact', stock: 1, min: 5 },
                { sku: 'BRID-195-65-15', name: 'Bridgestone Turanza', stock: 2, min: 8 },
                { sku: 'PIRE-215-60-16', name: 'Pirelli Cinturato', stock: 4, min: 12 },
              ].map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-semibold">{item.stock} unidades</p>
                    <p className="text-xs text-gray-500">Mín: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
