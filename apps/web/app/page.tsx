import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tire Distributor Pro 2025 - Plataforma Multi-Tenant de Distribuição de Pneus',
  description: 'A plataforma mais avançada para distribuidores de pneus. Multi-tenant, AI-powered, com gestão completa de inventário, frotas e recapagens.',
}

const features = [
  'Sites filhos instantâneos para revendedores',
  'Sincronização de stock em tempo real',
  'Gestão de frotas e TPMS',
  'Sistema de recapagens com blockchain',
  'AI para otimização de preços',
  'Integração com Stripe Connect',
  'Dashboard completo de BI',
  'Sustentabilidade e pegada de carbono',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">TireDistributor Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/onboard/parent" className="btn-primary">
              Começar Agora
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            A Plataforma Definitiva para
            <span className="text-primary-600"> Distribuidores de Pneus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-balance">
            Multi-tenant, AI-powered, com gestão completa de inventário, frotas, recapagens e muito mais.
            Crie sites para seus revendedores em segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/onboard/parent" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
              Criar Distribuidor
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
              Ver Demo
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="card text-left">
                <CheckIcon className="w-6 h-6 text-green-500 mb-3" />
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">10+</div>
              <div className="text-gray-600">Módulos Avançados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">95%+</div>
              <div className="text-gray-600">Cobertura de Testes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600">Monitorização IoT</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">∞</div>
              <div className="text-gray-600">Sites Filhos</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Tire Distributor Pro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
