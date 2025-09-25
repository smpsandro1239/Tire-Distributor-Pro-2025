'use client'

import { trpc } from '@/app/lib/trpc'
import { Button, Card, CardContent, CardHeader } from '@tire-distributor/ui'
import { useState } from 'react'

export default function CatalogPage() {
  const [filters, setFilters] = useState<{
    search: string;
    brandId: string;
    vehicleType: 'CAR' | 'TRUCK' | 'MOTORCYCLE' | 'BUS' | 'AGRICULTURAL' | 'INDUSTRIAL' | '';
    minPrice: string;
    maxPrice: string;
    page: number;
  }>({
    search: '',
    brandId: '',
    vehicleType: 'CAR',
    minPrice: '',
    maxPrice: '',
    page: 1,
  })

  const { data: tires, isLoading } = trpc.tire.list.useQuery({
    ...filters,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    vehicleType: filters.vehicleType || undefined,
  })

  const { data: brands } = trpc.tire.list.useQuery({ page: 1, limit: 100 })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Pneus</h1>

      {/* Filtros */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Filtros</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="px-3 py-2 border rounded-lg"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />

            <select
              className="px-3 py-2 border rounded-lg"
              value={filters.vehicleType}
              onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value as 'CAR' | 'TRUCK' | 'MOTORCYCLE' | 'BUS' | 'AGRICULTURAL' | 'INDUSTRIAL' | '' })}
            >
              <option value="">Tipo de Veículo</option>
              <option value="CAR">Automóvel</option>
              <option value="TRUCK">Camião</option>
              <option value="MOTORCYCLE">Motociclo</option>
              <option value="BUS">Autocarro</option>
            </select>

            <input
              type="number"
              placeholder="Preço mín."
              className="px-3 py-2 border rounded-lg"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />

            <input
              type="number"
              placeholder="Preço máx."
              className="px-3 py-2 border rounded-lg"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />

            <Button onClick={() => setFilters({ ...filters, page: 1 })}>
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pneus */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">A carregar pneus...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tires?.tires.map((tire) => (
            <Card key={tire.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {tire.images.length > 0 ? (
                    <img
                      src={tire.images[0]}
                      alt={tire.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400">Sem imagem</div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2">{tire.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{tire.brand.name}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {tire.width}/{tire.aspectRatio}R{tire.rimDiameter}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    €{tire.basePrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {tire.stockQty}
                  </span>
                </div>

                {tire.ecoScore && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>EcoScore</span>
                      <span className="font-semibold">{(tire.ecoScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${tire.ecoScore * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <Button className="w-full">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {tires && tires.pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: tires.pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === filters.page ? 'primary' : 'secondary'}
              onClick={() => setFilters({ ...filters, page })}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
