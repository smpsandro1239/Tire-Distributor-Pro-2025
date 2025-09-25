import { prisma } from '@tire-distributor/db'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface ResellerLayoutProps {
  children: React.ReactNode
  params: { subdomain: string }
}

export async function generateMetadata({ params }: ResellerLayoutProps): Promise<Metadata> {
  const reseller = await prisma.tenant.findUnique({
    where: {
      subdomain: params.subdomain,
      type: 'RESELLER',
      isActive: true
    }
  })

  if (!reseller) {
    return {
      title: 'Loja não encontrada',
      description: 'Esta loja não existe ou está inativa.'
    }
  }

  return {
    title: reseller.metaTitle || `${reseller.brandName || reseller.name} - Pneus de Qualidade`,
    description: reseller.metaDescription || `Encontre os melhores pneus na ${reseller.brandName || reseller.name}. Qualidade garantida e entrega rápida.`,
    keywords: `pneus, ${reseller.brandName || reseller.name}, ${reseller.city}, automóvel, caminhão`,
    openGraph: {
      title: reseller.metaTitle || `${reseller.brandName || reseller.name}`,
      description: reseller.metaDescription || `Pneus de qualidade na ${reseller.brandName || reseller.name}`,
      images: reseller.logo ? [{ url: reseller.logo }] : [],
      type: 'website',
    },
    icons: {
      icon: reseller.favicon || '/favicon.ico',
    },
    other: {
      'theme-color': reseller.primaryColor,
    }
  }
}

export default async function ResellerLayout({ children, params }: ResellerLayoutProps) {
  const reseller = await prisma.tenant.findUnique({
    where: {
      subdomain: params.subdomain,
      type: 'RESELLER',
      isActive: true
    }
  })

  if (!reseller) {
    notFound()
  }

  return (
    <html lang="pt">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary-color: ${reseller.primaryColor};
              --secondary-color: ${reseller.secondaryColor};
              --accent-color: ${reseller.accentColor};
            }

            .btn-primary {
              background-color: var(--primary-color);
              border-color: var(--primary-color);
            }

            .btn-primary:hover {
              background-color: color-mix(in srgb, var(--primary-color) 90%, black);
              border-color: color-mix(in srgb, var(--primary-color) 90%, black);
            }

            .text-primary {
              color: var(--primary-color);
            }

            .bg-primary {
              background-color: var(--primary-color);
            }

            .border-primary {
              border-color: var(--primary-color);
            }
          `
        }} />

        {/* Google Analytics */}
        {reseller.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${reseller.googleAnalyticsId}`} />
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${reseller.googleAnalyticsId}');
              `
            }} />
          </>
        )}

        {/* Facebook Pixel */}
        {reseller.facebookPixelId && (
          <script dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${reseller.facebookPixelId}');
              fbq('track', 'PageView');
            `
          }} />
        )}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
