import { router } from '../trpc'
import { fleetRouter } from './fleet'
import { retreadRouter } from './retread'
import { sensorRouter } from './sensor'
import { tenantRouter } from './tenant'
import { tireRouter } from './tire'

export const appRouter = router({
  tenant: tenantRouter,
  tire: tireRouter,
  fleet: fleetRouter,
  sensor: sensorRouter,
  retread: retreadRouter,
})

export type AppRouter = typeof appRouter
