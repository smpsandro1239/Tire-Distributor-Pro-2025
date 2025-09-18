'use client'

import { trpc } from '@/lib/trpc'
import { Button, Card, CardContent, CardHeader } from '@tire-distributor/ui'
import { useState } from 'react'

export default function SensorsPage() {
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    position: '',
  })

  const { data: sensors, isLoading } = trpc.sensor.list.useQuery(filters)
  const { data: alerts } = trpc.sensor.getAlerts.useQuery({})
  const { data: analytics } = trpc.sensor.getAnalytics.useQuery({})

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      'FRONT_LEFT': 'Frente Esquerda',
      'FRONT_RIGHT': 'Frente Direita',
      'REAR_LEFT': 'Trás Esquerda',
      'REAR_RIGHT': 'Trás Direita',
    }
    return labels[position] || position
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Monitorização de Sensores</h1>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sensores</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalSensors}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.activeSensors}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pressão Média</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics.avgPressure} bar</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offline</p>
                  <p className="text-3xl font-bold text-red-600">{analytics.offlineSensors}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas */}
      {alerts && alerts.alerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-600">
              Alertas Ativos ({alerts.alerts.length})
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-75">
                        {alert.sensor.vehicle.make} {alert.sensor.vehicle.model} - {getPositionLabel(alert.sensor.position)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium">{alert.severity}</span>
                      <p className="text-xs opacity-75">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Filtros</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
            >
              <option value="">Todos os Estados</option>
              <option value="true">Apenas Ativos</option>
              <option value="false">Apenas Inativos</option>
            </select>

            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.position}
              onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            >
              <option value="">Todas as Posições</option>
              <option value="FRONT_LEFT">Frente Esquerda</option>
              <option value="FRONT_RIGHT">Frente Direita</option>
              <option value="REAR_LEFT">Trás Esquerda</option>
              <option value="REAR_RIGHT">Trás Direita</option>
            </select>

            <Button onClick={() => setFilters({ isActive: undefined, position: '' })}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sensores */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">A carregar sensores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors?.sensors.map((sensor) => (
            <Card key={sensor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{sensor.sensorId}</h3>
                    <p className="text-sm text-gray-600">
                      {sensor.vehicle.make} {sensor.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getPositionLabel(sensor.position)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sensor.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {sensor.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-3">
                  {sensor.pressure && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pressão</span>
                      <span className={`font-semibold ${
                        sensor.pressure < 6.0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {sensor.pressure} bar
                      </span>
                    </div>
                  )}

                  {sensor.temperature && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temperatura</span>
                      <span className={`font-semibold ${
                        sensor.temperature > 80 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {sensor.temperature}°C
                      </span>
                    </div>
                  )}

                  {sensor.batteryLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bateria</span>
                      <span className={`font-semibold ${
                        sensor.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {sensor.batteryLevel}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última Leitura</span>
                    <span className="text-sm text-gray-500">
                      {sensor.lastReading
                        ? new Date(sensor.lastReading).toLocaleString()
                        : 'Nunca'
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button size="sm" className="w-full">
                    Ver Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
