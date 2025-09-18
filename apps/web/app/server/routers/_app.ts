import { router } from '../trpc'
import { tenantRouter } from './tenant'
import { tireRouter } from './tire'

export const appRouter = router({
  tenant: tenantRouter,
  tire: tireRouter,
})

export type AppRouter = typeof appRouter
