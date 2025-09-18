import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../api/trpc/[trpc]/route'

export const trpc = createTRPCReact<AppRouter>()
