'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { trpc } from '../../lib/trpc'

export default function ParentOnboardPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'PT',
  })

  const createDistributor = trpc.tenant.create.useMutation({
    onSuccess: (tenant) => {
      router.push(`/dashboard?tenant=${tenant.slug}`)
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    createDistributor.mutate({
      slug,
      name: formData.name,
      email: formData.email,
      margin: 0, // Distributor has no margin
      parentId: '', // This will be the root distributor
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Criar Distribuidor Principal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configure sua plataforma de distribuição de pneus
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Empresa
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Distribuidora de Pneus Lda"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="admin@distribuidora.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="+351 123 456 789"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Morada
              </label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="input"
                  placeholder="Rua das Empresas, 123"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <div className="mt-1">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="input"
                    placeholder="Lisboa"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  País
                </label>
                <div className="mt-1">
                  <select
                    id="country"
                    name="country"
                    className="input"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="PT">Portugal</option>
                    <option value="ES">Espanha</option>
                    <option value="FR">França</option>
                    <option value="BR">Brasil</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={createDistributor.isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createDistributor.isLoading ? 'Criando...' : 'Criar Distribuidor'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Funcionalidades incluídas</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Sites filhos ilimitados</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Sincronização de stock em tempo real</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Gestão de frotas e IoT</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">AI para otimização de preços</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
