# Tire-Distributor-Pro 2025

🎯 **Plataforma Multi-Tenant de Distribuição de Pneus**

Stack: Next.js 15, Supabase 3, tRPC v11, TanStack Query 5, Tailwind 4, Framer Motion 12, Stripe Connect 2, Vercel Edge, Postgres 16, Prisma 6, React Native Expo 51, Vercel AI SDK 4, Kafka 3.8

## Quick Start

```bash
git clone https://github.com/YOU/tire-distributor-pro-2025.git && cd tire-distributor-pro-2025
cp .env.example .env            # add STRIPE_SECRET, SUPABASE_SERVICE_ROLE, KAFKA_URI
npm i -g pnpm@9 vercel@latest
pnpm i
pnpm db:push                    # Prisma + Supabase migrations
pnpm kafka:up                   # docker-compose -f infra/kafka.yml up -d
pnpm dev                        # localhost:3000 (parent) | rev1.localhost:3000 (child)
vercel --prod                   # auto-wildcard *.tiredist.com + SSL
```

## Features

- **Main site** (tiredist.com) – B2B + B2C catalog, headless CMS, SEO, multi-language, multi-currency, PWA
- **Instant child-sites** – revendedor1.tiredist.com with real-time stock sync
- **Complete back-office** – inventory, forecasting, purchasing, logistics, CRM, support, accounting, BI
- **10 Advanced Modules**: FleetHub, RetreadCloud, SensorLink, TireFinance, RecallGuard, EcoScore, WarrantyWallet, InsureTire, PriceBrain, VoiceOrder

## Architecture

- **Multi-tenant**: Row-level security, tenant isolation
- **Event-driven**: Kafka topics for stock, orders, invoices, shipments, warranties, sensors
- **Production-grade**: ≥95% test coverage, GDPR/CCPA, WCAG 2.2 AA, CSP, rate-limit, 2FA
