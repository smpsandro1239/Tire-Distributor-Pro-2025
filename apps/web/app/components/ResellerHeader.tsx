'use client'

import { Bars3Icon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ResellerHeaderProps {
  reseller: {
    id: string
    name: string
    brandName?: string | null
    logo?: string | null
    phone?: string | null
    whatsapp?: string | null
    primaryColor: string
    subdomain?: string | null
  }
}

export function ResellerHeader({ reseller }: ResellerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { state, toggleCart } = useCart()

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Catálogo', href: '/catalog' },
    { name: 'Sobre', href: '/about' },
    { name: 'Contato', href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            {reseller.logo ? (
              <Image
                src={reseller.logo}
                alt={reseller.brandName || reseller.name}
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            ) : (
              <span
                className="text-xl font-bold"
                style={{ color: reseller.primaryColor }}
              >
                {reseller.brandName || reseller.name}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {/* WhatsApp */}
          {reseller.whatsapp && (
            <a
              href={`https://wa.me/${reseller.whatsapp}`}
              className="text-sm font-semibold leading-6 text-green-600 hover:text-green-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}

          {/* Phone */}
          {reseller.phone && (
            <a
              href={`tel:${reseller.phone}`}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
            >
              {reseller.phone}
            </a>
          )}

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {state.itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                style={{ backgroundColor: reseller.primaryColor }}
              >
                {state.itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                {reseller.logo ? (
                  <Image
                    src={reseller.logo}
                    alt={reseller.brandName || reseller.name}
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span
                    className="text-lg font-bold"
                    style={{ color: reseller.primaryColor }}
                  >
                    {reseller.brandName || reseller.name}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-2">
                  {reseller.whatsapp && (
                    <a
                      href={`https://wa.me/${reseller.whatsapp}`}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-green-600 hover:bg-gray-50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                  {reseller.phone && (
                    <a
                      href={`tel:${reseller.phone}`}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Telefone: {reseller.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
