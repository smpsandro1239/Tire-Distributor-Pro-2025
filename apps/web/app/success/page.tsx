'use client'

import { CheckCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '../../packages/ui/src/components/Button'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // TODO: Fetch order details from API
      fetchOrderDetails(sessionId)
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      // TODO: Implement API endpoint to get order details
      const response = await fetch(`/api/orders/session/${sessionId}`)
      const data = await response.json()
      setOrderDetails(data)
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Pedido Confirmado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Obrigado pela sua compra. Recebeu um email de confirmação.
            </p>
          </div>

          {sessionId && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Detalhes do Pedido
              </h3>
              <p className="text-sm text-gray-600">
                ID da Sessão: <span className="font-mono">{sessionId}</span>
              </p>
              {orderDetails && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Total: €{orderDetails.total?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {orderDetails.customerEmail}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button className="w-full">
              <Link href="/orders" className="flex items-center justify-center">
                Ver Meus Pedidos
              </Link>
            </Button>

            <Button variant="outline" className="w-full">
              <Link href="/" className="flex items-center justify-center">
                <ShoppingBagIcon className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Tem alguma questão sobre o seu pedido?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                Entre em contacto connosco
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
