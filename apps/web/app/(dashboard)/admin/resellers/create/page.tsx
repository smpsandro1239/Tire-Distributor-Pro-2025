'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '../../../../../../packages/ui/src/components/Button'
import { Modal } from '../../../../../../packages/ui/src/components/Modal'
import { api } from '../../../../server/api'

export default function CreateResellerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    subdomain: '',
    businessName: '',
    brandName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',

    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PT',

    // Business Settings
    margin: 0.18,
    commissionRate: 0.05,
    currency: 'EUR',
    taxRate: 0.23,

    // Branding
    logo: '',
    favicon: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    tagline: '',
    metaTitle: '',
    metaDescription: '',

    // Features
    enableB2C: true,
    enableReviews: true,
    enableChat: true,
    enableAR: false,
    enableLoyalty: false,
    carbonNeutral: false,

    // Analytics
    googleAnalyticsId: '',
    facebookPixelId: '',
  })

  const createResellerMutation = api.reseller.create.useMutation({
    onSuccess: (reseller) => {
      router.push(`/admin/resellers/${reseller.id}`)
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createResellerMutation.mutateAsync({
        name: formData.businessName,
        brandName: formData.brandName || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        country: formData.country,
        margin: formData.margin,
        commissionRate: formData.commissionRate,
        logo: formData.logo || undefined,
        favicon: formData.favicon || undefined,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        tagline: formData.tagline || undefined,
        metaTitle: formData.metaTitle || undefined,
        metaDescription: formData.metaDescription || undefined,
        subdomain: formData.subdomain,
        languages: ['pt'],
        currency: formData.currency,
        taxRate: formData.taxRate,
        enableB2C: formData.enableB2C,
        enableReviews: formData.enableReviews,
        enableChat: formData.enableChat,
        enableAR: formData.enableAR,
        enableLoyalty: formData.enableLoyalty,
        googleAnalyticsId: formData.googleAnalyticsId || undefined,
        facebookPixelId: formData.facebookPixelId || undefined,
        carbonNeutral: formData.carbonNeutral,
      })
    } catch (error) {
      console.error('Error creating reseller:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSubdomain = () => {
    const name = formData.businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15)
    setFormData(prev => ({ ...prev, subdomain: name }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Novo Revendedor</h1>
        <p className="text-gray-600 mt-2">
          Configure um novo site B2C para um revendedor com personalização completa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Pneus Silva Lda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Marca (B2C)
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Silva Pneus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subdomínio *
              </label>
              <div className="flex">
                <input
                  type="text"
                  required
                  value={formData.subdomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="silva"
                  pattern="[a-z0-9-]+"
                  minLength={3}
                  maxLength={20}
                />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                  .tiredist.com
                </span>
              </div>
              <button
                type="button"
                onClick={generateSubdomain}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                Gerar automaticamente
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contato@silva.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+351 912 345 678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="351912345678"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morada
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rua das Flores, 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lisboa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000-001"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações Comerciais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margem do Revendedor (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.margin * 100}
                onChange={(e) => setFormData(prev => ({ ...prev, margin: Number(e.target.value) / 100 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comissão do Distribuidor (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={formData.commissionRate * 100}
                onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: Number(e.target.value) / 100 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de IVA (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={formData.taxRate * 100}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) / 100 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personalização Visual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Logotipo
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slogan/Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Os melhores pneus da região"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor Primária
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor Secundária
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'enableB2C', label: 'Loja B2C Ativa', description: 'Permitir vendas diretas ao consumidor' },
              { key: 'enableReviews', label: 'Sistema de Avaliações', description: 'Clientes podem avaliar produtos' },
              { key: 'enableChat', label: 'Chat de Suporte', description: 'Widget de chat no site' },
              { key: 'enableAR', label: 'Realidade Aumentada', description: 'Visualização AR de pneus' },
              { key: 'enableLoyalty', label: 'Programa de Fidelidade', description: 'Sistema de pontos e recompensas' },
              { key: 'carbonNeutral', label: 'Empresa Carbono Neutro', description: 'Exibir selo de sustentabilidade' },
            ].map((feature) => (
              <div key={feature.key} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={feature.key}
                  checked={formData[feature.key as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData(prev => ({ ...prev, [feature.key]: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor={feature.key} className="text-sm font-medium text-gray-700 cursor-pointer">
                    {feature.label}
                  </label>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            Pré-visualizar Site
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Revendedor'}
            </Button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Pré-visualização do Site"
        size="lg"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Assim ficará o site do revendedor:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-lg font-bold" style={{ color: formData.primaryColor }}>
                {formData.brandName || formData.businessName}
              </div>
              {formData.tagline && (
                <div className="text-sm text-gray-600 mt-1">
                  {formData.tagline}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {formData.subdomain}.tiredist.com
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
