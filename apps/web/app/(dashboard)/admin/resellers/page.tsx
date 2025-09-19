'use client'

import {
    ChartBarIcon,
    EyeIcon,
    GlobeAltIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '../../../../../packages/ui/src/components/Button'
import { LoadingSpinner } from '../../../../../packages/ui/src/components/LoadingSpinner'
import { api } from '../../../server/api'

export default function ResellersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = api.reseller.list.useQuery({
    search: search || undefined,
    status,
    page,
    limit: 10,
  })

  const toggleStatusMutation = api.reseller.update.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleToggleStatus = async (resellerId: string, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({
      id: resellerId,
      isActive: !currentStatus,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revendedores</h1>
          <p className="text-gray-600">
            Gerencie seus revendedores e seus sites B2C
          </p>
        </div>
        <Link href="/admin/resellers/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Novo Revendedor
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, cidade ou subdomínio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <GlobeAltIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{data?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ativos</p>
              <p className="text-lg font-semibold text-gray-900">
                {data?.resellers.filter(r => r.isActive).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pedidos (30d)</p>
              <p className="text-lg font-semibold text-gray-900">
                {data?.resellers.reduce((sum, r) => sum + (r._count?.orders || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 text-purple-600">€</div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Receita Média</p>
              <p className="text-lg font-semibold text-gray-900">€2.450</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resellers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site B2C
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estatísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.resellers.map((reseller) => (
                <tr key={reseller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {reseller.logo ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={reseller.logo}
                            alt={reseller.name}
                          />
                        ) : (
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: reseller.primaryColor }}
                          >
                            {reseller.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reseller.brandName || reseller.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reseller.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reseller.subdomain ? (
                        <a
                          href={`https://${reseller.subdomain}.tiredist.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {reseller.subdomain}.tiredist.com
                          <GlobeAltIcon className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">Não configurado</span>
                      )}
                    </div>
                    {reseller.customDomain && (
                      <div className="text-xs text-gray-500">
                        + {reseller.customDomain}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{reseller.city}</div>
                    <div className="text-xs text-gray-500">{reseller.country}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(reseller.id, reseller.isActive)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        reseller.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {reseller.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{reseller._count?.orders || 0} pedidos</span>
                      <span className="text-xs text-gray-500">
                        {reseller._count?.tires || 0} produtos
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {reseller.subdomain && (
                        <a
                          href={`https://${reseller.subdomain}.tiredist.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver site"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </a>
                      )}

                      <Link
                        href={`/admin/resellers/${reseller.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/admin/resellers/${reseller.id}/analytics`}
                        className="text-green-600 hover:text-green-900"
                        title="Analytics"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(page - 1) * 10 + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(page * 10, data.total)}
                  </span>{' '}
                  de <span className="font-medium">{data.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {data?.resellers.length === 0 && (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum revendedor encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro revendedor.'}
          </p>
          {!search && (
            <div className="mt-6">
              <Link href="/admin/resellers/create">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Criar Primeiro Revendedor
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
