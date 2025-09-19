'use client'

import { MinusIcon, PlusIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Button } from '../../../packages/ui/src/components/Button'
import { useCart } from '../contexts/CartContext'

interface CartSidebarProps {
  reseller: {
    id: string
    name: string
    primaryColor: string
    currency: string
  }
}

export function CartSidebar({ reseller }: CartSidebarProps) {
  const { state, removeItem, updateQuantity, closeCart } = useCart()

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          resellerId: reseller.id,
          customerEmail: '', // TODO: Get from user input or auth
          successUrl: `${window.location.origin}/success`,
          cancelUrl: window.location.href,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erro ao processar checkout. Tente novamente.')
    }
  }

  if (!state.isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Carrinho de Compras
                </h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={closeCart}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="mt-8">
                <div className="flow-root">
                  {state.items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Carrinho vazio
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Adicione alguns pneus ao seu carrinho.
                      </p>
                    </div>
                  ) : (
                    <ul className="-my-6 divide-y divide-gray-200">
                      {state.items.map((item) => (
                        <li key={item.id} className="flex py-6">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Sem imagem</span>
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3 className="text-sm">{item.name}</h3>
                                <p className="ml-4">€{item.price.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.brand} • {item.size}
                              </p>
                              <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                            </div>

                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                  disabled={item.quantity <= 1}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="flex">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>€{state.total.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Portes de envio calculados no checkout.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    style={{ backgroundColor: reseller.primaryColor }}
                  >
                    Finalizar Compra
                  </Button>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    ou{' '}
                    <button
                      type="button"
                      className="font-medium hover:text-gray-800"
                      style={{ color: reseller.primaryColor }}
                      onClick={closeCart}
                    >
                      Continuar Compras
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
