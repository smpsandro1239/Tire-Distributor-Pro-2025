'use client'

import { trpc } from '@/lib/trpc'
import { Button, Card, CardContent, CardHeader, Modal } from '@tire-distributor/ui'
import { useState } from 'react'

export default function FleetPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFleet, setNewFleet] = useState({
    name: '',
    type: 'LOGISTICS' as const,
    managerName: '',
    managerEmail: '',
    managerPhone: '',
  })

  const { data: fleets, isLoading, refetch } = trpc.fleet.list.useQuery({})
  const createFleetMutation = trpc.fleet.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowCreateModal(false)
      setNewFleet({
        name: '',
        type: 'LOGISTICS',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
      })
    }
  })

  const handleCreateFleet = () => {
    createFleetMutation.mutate(newFleet)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestão de Frotas</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Nova Frota
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">A carregar frotas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fleets?.fleets.map((fleet) => (
            <Card key={fleet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{fleet.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{fleet.type.toLowerCase()}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {fleet.vehicles.length} veículos
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {fleet.managerName && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Gestor</p>
                    <p className="text-sm text-gray-600">{fleet.managerName}</p>
                    {fleet.managerEmail && (
                      <p className="text-sm text-gray-600">{fleet.managerEmail}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Sensores Ativos</span>
                    <span className="font-semibold">
                      {fleet.vehicles.reduce((acc, vehicle) =>
                        acc + vehicle.sensors.filter(s => s.isActive).length, 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Última Leitura</span>
                    <span className="text-gray-600">
                      {fleet.vehicles.length > 0 && fleet.vehicles[0].sensors.length > 0
                        ? new Date(fleet.vehicles[0].sensors[0].lastReading || '').toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Frota"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Frota
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newFleet.name}
              onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
              placeholder="Ex: Frota Logística Norte"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Frota
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newFleet.type}
              onChange={(e) => setNewFleet({ ...newFleet, type: e.target.value as any })}
            >
              <option value="LOGISTICS">Logística</option>
              <option value="EMERGENCY">Emergência</option>
              <option value="CONSTRUCTION">Construção</option>
              <option value="AGRICULTURE">Agricultura</option>
              <option value="MUNICIPAL">Municipal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Gestor
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newFleet.managerName}
              onChange={(e) => setNewFleet({ ...newFleet, managerName: e.target.value })}
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email do Gestor
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newFleet.managerEmail}
              onChange={(e) => setNewFleet({ ...newFleet, managerEmail: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone do Gestor
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newFleet.managerPhone}
              onChange={(e) => setNewFleet({ ...newFleet, managerPhone: e.target.value })}
              placeholder="+351 xxx xxx xxx"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateFleet}
              disabled={!newFleet.name || createFleetMutation.isLoading}
              className="flex-1"
            >
              {createFleetMutation.isLoading ? 'A criar...' : 'Criar Frota'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
