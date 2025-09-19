'use client'

import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useState } from 'react'

interface TireCardProps {
  tire: {
    id: string
    sku: string
    name: string
    description?: string | null
    brand: {
      name: string
      logo?: string | null
    }
    category: {
      name: string
    }
    width: number
    aspectRatio: number
    rimDiameter: number
    loadIndex?: string | null
    speedRating?: string | null
    season: string
    finalPrice?: number | null
    basePrice: number
    margin: number
    stockQty: number
    images: string[]
    ecoScore?: number | null
    warrantyMonths: number
    featured: boolean
  }
  reseller: {
    id: string
    name: string
    primaryColor: string
    margin: number
  }
}

export function TireCard({ tire, reseller }: TireCardProps) {
  const [imageError, setImageError] = useState(false)
  const { addItem, openCart } = useCart()

  // Calculate final price with reseller margin
  const finalPrice = tire.finalPrice || (tire.basePrice * (1 + reseller.margin))

  const handleAddToCart = () => {
    addItem({
      tireId: tire.id,
      name: tire.name,
      brand: tire.brand.name,
      size: `${tire.width}/${tire.aspectRatio}R${tire.rimDiameter}`,
      price: finalPrice,
      image: tire.images[0],
      sku: tire.sku,
    })
    openCart()
  }

  // Format tire size
  const tireSize = `${tire.width}/${tire.aspectRatio}R${tire.rimDiameter}`

  // Get season icon and color
  const getSeasonInfo = (season: string) => {
    switch (season) {
      case 'SUMMER':
        return { icon: '☀️', color: 'text-yellow-600', label: 'Verão' }
      case 'WINTER':
        return { icon: '❄️', color: 'text-blue-600', label: 'Inverno' }
      default:
        return { icon: '🌤️', color: 'text-green-600', label: 'All Season' }
    }
  }

  const seasonInfo = getSeasonInfo(tire.season)

  // Render eco score stars
  const renderEcoScore = () => {
    if (!tire.ecoScore) return null

    const stars = Math.round(tire.ecoScore * 5)
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= stars ? (
            <StarIcon key={star} className="w-3 h-3 text-green-500" />
          ) : (
            <StarOutlineIcon key={star} className="w-3 h-3 text-gray-300" />
          )
        ))}
        <span className="text-xs text-green-600 ml-1">Eco</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {tire.featured && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Destaque
            </span>
          </div>
        )}

        {tire.images.length > 0 && !imageError ? (
          <Image
            src={tire.images[0]}
            alt={tire.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Sem imagem</p>
            </div>
          </div>
        )}

        {/* Brand logo overlay */}
        {tire.brand.logo && (
          <div className="absolute bottom-2 right-2 bg-white rounded p-1">
            <Image
              src={tire.brand.logo}
              alt={tire.brand.name}
              width={40}
              height={20}
              className="h-5 w-auto"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand and Category */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-gray-600">
            {tire.brand.name}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${seasonInfo.color} bg-opacity-10`}>
            {seasonInfo.icon} {seasonInfo.label}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {tire.name}
        </h3>

        {/* Size and specs */}
        <div className="text-sm text-gray-600 mb-2">
          <div className="font-mono font-bold">{tireSize}</div>
          {tire.loadIndex && tire.speedRating && (
            <div className="text-xs">
              Índice: {tire.loadIndex}{tire.speedRating}
            </div>
          )}
        </div>

        {/* Eco score */}
        {renderEcoScore()}

        {/* Stock status */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${
            tire.stockQty > 10 ? 'bg-green-500' :
            tire.stockQty > 0 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-600">
            {tire.stockQty > 10 ? 'Em estoque' :
             tire.stockQty > 0 ? `Últimas ${tire.stockQty} unidades` : 'Sem estoque'}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold text-gray-900">
              €{finalPrice.toFixed(2)}
            </div>
            {tire.finalPrice !== tire.basePrice && (
              <div className="text-xs text-gray-500 line-through">
                €{tire.basePrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* Warranty */}
          <div className="text-xs text-gray-500 text-right">
            <div>Garantia</div>
            <div className="font-semibold">{tire.warrantyMonths} meses</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            disabled={tire.stockQty === 0}
          >
            Ver Detalhes
          </button>

          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: tire.stockQty > 0 ? reseller.primaryColor : '#9CA3AF'
            }}
            disabled={tire.stockQty === 0}
            title="Adicionar ao carrinho"
          >
            <ShoppingCartIcon className="w-4 h-4" />
          </button>
        </div>

        {/* SKU */}
        <div className="mt-2 text-xs text-gray-400">
          SKU: {tire.sku}
        </div>
      </div>
    </div>
  )
}
