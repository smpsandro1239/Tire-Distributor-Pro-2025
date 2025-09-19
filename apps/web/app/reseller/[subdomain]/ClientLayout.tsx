'use client'

import { CartSidebar } from '../../components/CartSidebar'
import { CartProvider } from '../../contexts/CartContext'

interface ClientLayoutProps {
  children: React.ReactNode
  reseller: {
    id: string
    name: string
    primaryColor: string
    currency: string
  }
}

export function ClientLayout({ children, reseller }: ClientLayoutProps) {
  return (
    <CartProvider>
      {children}
      <CartSidebar reseller={reseller} />
    </CartProvider>
  )
}
