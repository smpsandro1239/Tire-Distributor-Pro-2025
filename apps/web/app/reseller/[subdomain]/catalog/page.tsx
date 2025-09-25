'use client';

import { Tire } from '@tire-distributor/db';
import { Button } from '@tire-distributor/ui';
import { useEffect, useState } from 'react';
import { TireCard } from '../../../components/TireCard';

interface CatalogPageProps {
  params: { subdomain: string };
}

export default function CatalogPage({ params }: CatalogPageProps) {
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    size: '',
  });

  useEffect(() => {
    fetchTires();
  }, [params.subdomain, filters]);

  const fetchTires = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('reseller', params.subdomain);

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/tires?${queryParams}`);
      const data = await response.json();
      setTires(data.tires || []);
    } catch (error) {
      console.error('Erro ao carregar pneus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      size: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Catálogo de Pneus
        </h1>
        <p className="text-gray-600">
          Encontre os melhores pneus para seu veículo
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as marcas</option>
              <option value="Michelin">Michelin</option>
              <option value="Bridgestone">Bridgestone</option>
              <option value="Goodyear">Goodyear</option>
              <option value="Continental">Continental</option>
              <option value="Pirelli">Pirelli</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              <option value="Passeio">Passeio</option>
              <option value="SUV">SUV</option>
              <option value="Caminhão">Caminhão</option>
              <option value="Moto">Moto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho
            </label>
            <input
              type="text"
              placeholder="Ex: 205/55R16"
              value={filters.size}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço Mín.
            </label>
            <input
              type="number"
              placeholder="R$ 0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço Máx.
            </label>
            <input
              type="number"
              placeholder="R$ 1000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={fetchTires} variant="primary">
            Aplicar Filtros
          </Button>
          <Button onClick={clearFilters} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {tires.length} pneu{tires.length !== 1 ? 's' : ''} encontrado{tires.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tire Grid */}
      {tires.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tires.map((tire) => (
            <TireCard key={tire.id} tire={tire} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum pneu encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros para encontrar o que procura
          </p>
        </div>
      )}
    </div>
  );
}
