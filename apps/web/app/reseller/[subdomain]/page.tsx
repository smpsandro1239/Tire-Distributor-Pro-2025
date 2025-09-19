import { notFound } from 'next/navigation';
import { db } from '../../../../packages/db';
import { ResellerFooter } from '../../components/ResellerFooter';
import { ResellerHeader } from '../../components/ResellerHeader';
import { TireCard } from '../../components/TireCard';
import { ClientWrapper } from './ClientWrapper';

interface ResellerPageProps {
  params: { subdomain: string };
}

export default async function ResellerPage({ params }: ResellerPageProps) {
  // Get reseller data
  const reseller = await db.tenant.findUnique({
    where: {
      subdomain: params.subdomain,
      type: 'RESELLER',
      isActive: true,
    },
  });

  if (!reseller) {
    notFound();
  }

  // Get featured tires for this reseller
  const featuredTires = await db.tire.findMany({
    where: {
      tenantId: reseller.id,
      visible: true,
      featured: true,
      stockQty: { gt: 0 },
    },
    include: {
      brand: true,
      category: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  // Get categories
  const categories = await db.tireCategory.findMany({
    take: 4,
    orderBy: { name: 'asc' },
  });

  return (
    <ClientWrapper reseller={reseller}>
      <div
        className="min-h-screen"
        style={{
          '--primary-color': reseller.primaryColor,
          '--secondary-color': reseller.secondaryColor,
          '--accent-color': reseller.accentColor,
        } as React.CSSProperties}
      >
        <ResellerHeader reseller={reseller} />

        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {reseller.brandName || reseller.name}
              </h1>
              {reseller.tagline && (
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  {reseller.tagline}
                </p>
              )}
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a
                  href={`/reseller/${params.subdomain}/catalog`}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Ver Catálogo
                </a>
                {reseller.whatsapp && (
                  <a
                    href={`https://wa.me/${reseller.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Qualidade Garantida</h3>
                  <p className="text-gray-600">Pneus das melhores marcas com garantia de qualidade</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
                  <p className="text-gray-600">Receba seus pneus rapidamente em casa</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Melhor Preço</h3>
                  <p className="text-gray-600">Preços competitivos e condições especiais</p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products */}
          {featuredTires.length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">
                  Produtos em Destaque
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredTires.map((tire) => (
                    <TireCard
                      key={tire.id}
                      tire={tire}
                      reseller={reseller}
                    />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <a
                    href={`/reseller/${params.subdomain}/catalog`}
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Ver Todos os Produtos
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Categories */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                Categorias
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/reseller/${params.subdomain}/catalog?category=${category.slug}`}
                    className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow group"
                  >
                    <div className="text-4xl mb-4">🚗</div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 bg-gray-900 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-8">Entre em Contato</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {reseller.phone && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Telefone</h3>
                    <p className="text-gray-300">{reseller.phone}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-gray-300">{reseller.email}</p>
                </div>

                {reseller.address && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Endereço</h3>
                    <p className="text-gray-300">
                      {reseller.address}
                      {reseller.city && `, ${reseller.city}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <ResellerFooter reseller={reseller} />
      </div>
    </ClientWrapper>
  );
}
