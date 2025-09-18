# Tire Distributor Pro 2025 🚗

Uma plataforma abrangente de distribuição de pneus multi-tenant construída com Next.js 15, Supabase e tecnologias web modernas.

## ✅ Estado Atual do Desenvolvimento

### Concluído
- ✅ Estrutura base do monorepo (Turborepo + pnpm workspaces)
- ✅ Schema Prisma completo com 15+ tabelas multi-tenant
- ✅ Routers tRPC implementados:
  - ✅ **Tire Router** - Gestão completa de pneus
  - ✅ **Fleet Router** - Gestão de frotas
  - ✅ **Sensor Router** - Monitorização IoT em tempo real
  - ✅ **Retread Router** - Rastreamento de recapagens
  - ✅ **Tenant Router** - Gestão multi-tenant
- ✅ Packages base criados (auth, stripe, ai, ui, kafka)
- ✅ Configuração TypeScript e dependências

### Em Desenvolvimento
- 🔄 Correção de erros de tipos TypeScript
- 🔄 Instalação completa de dependências
- 🔄 Configuração do banco de dados

### Por Fazer
- ⏳ Interface web (páginas Next.js)
- ⏳ Middleware de autenticação
- ⏳ Integração Stripe Connect
- ⏳ Sistema de alertas em tempo real
- ⏳ Dashboard de analytics
- ⏳ Aplicação mobile
- ⏳ Testes automatizados
- ⏳ CI/CD pipeline
- ⏳ Documentação completa

## 🚀 Quick Start

```bash
git clone https://github.com/YOU/tire-distributor-pro-2025.git && cd tire-distributor-pro-2025
cp .env.example .env            # adicionar STRIPE_SECRET, SUPABASE_SERVICE_ROLE, KAFKA_URI
npm i -g pnpm@9 vercel@latest
pnpm i
pnpm db:push                    # Prisma + Supabase migrations
pnpm kafka:up                   # docker-compose -f infra/kafka.yml up -d
pnpm dev                        # localhost:3000 (parent) | rev1.localhost:3000 (child)
vercel --prod                   # auto-wildcard *.tiredist.com + SSL
```

## 🚀 Funcionalidades Principais

### Core Business
- **Multi-tenancy**: Arquitectura pai-filho com isolamento completo
- **Sincronização em tempo real**: Stock sync via Kafka/WebSocket
- **Pricing dinâmico**: AI-powered com análise de concorrência
- **Gestão de margens**: Global, categoria ou SKU específico

### Módulos Avançados
- **FleetHub**: Gestão de frotas com contratos km/tempo
- **RetreadCloud**: Rastreamento de recapagens com QR/RFID
- **SensorLink**: Dados TPMS em tempo real (pressão/temperatura)
- **TireFinance**: Split-payments e leasing B2B
- **RecallGuard**: Monitorização de recalls ETRTO/DOT
- **EcoScore**: Pegada de carbono por pneu
- **WarrantyWallet**: Garantias blockchain (NFT)
- **PriceBrain**: AI dynamic pricing
- **VoiceOrder**: Encomendas por voz (WhatsApp/Alexa)

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 18, Tailwind CSS 4
- **Backend**: tRPC v11, Prisma 6, PostgreSQL 16
- **Real-time**: Supabase Realtime, Kafka 3.8
- **Pagamentos**: Stripe Connect 2
- **AI**: OpenAI GPT-4, Vercel AI SDK 4
- **Mobile**: React Native Expo 51
- **Infraestrutura**: Docker, Vercel Edge, GitHub Actions

## 📊 Routers tRPC Implementados

### 🔧 Sensor Router
- `list` - Listar sensores com filtros
- `getById` - Obter sensor específico
- `create` - Criar novo sensor
- `updateReadings` - Actualizar leituras IoT
- `assignTire` - Associar pneu a sensor
- `getAlerts` - Alertas de pressão/temperatura/bateria
- `getAnalytics` - Analytics dos sensores

### 🚛 Fleet Router
- `create` - Criar frota
- `list` - Listar frotas
- `getById` - Detalhes da frota
- `addVehicle` - Adicionar veículo
- `getAnalytics` - Analytics da frota
- `scheduleTireChange` - Agendar mudança de pneus

### ♻️ Retread Router
- `create` - Criar registo de recapagem
- `list` - Listar recapagens
- `getCasingHistory` - Histórico do casco
- `generateQRCode` - Gerar QR code
- `scanQRCode` - Scan QR code
- `getAnalytics` - Analytics de recapagens

## 🔄 Próximos Passos

1. **Resolver erros TypeScript** - Corrigir tipos implícitos
2. **Criar páginas web** - Interface de utilizador
3. **Implementar autenticação** - Middleware e RLS
4. **Configurar Stripe** - Connect accounts
5. **Testes** - Cobertura >95%
6. **Deploy** - Vercel + wildcard domains

## 📝 Licença

MIT - Veja o arquivo LICENSE para detalhes.
