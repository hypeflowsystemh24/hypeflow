import { createTRPCRouter } from './trpc'

// Admin routers (agency team)
import { trafegoRouter }      from './routers/admin/trafego'
import { callsRouter }        from './routers/admin/calls'
import { pipelineRouter }     from './routers/admin/pipeline'
import { leadsRouter }        from './routers/admin/leads'
import { clientsRouter }      from './routers/admin/clients'
import { automationsRouter }  from './routers/admin/automations'
import { integrationsRouter } from './routers/admin/integrations'
import { dashboardRouter }    from './routers/admin/dashboard'

// Client routers (portal)
import { dashboardRouter as clientDashboardRouter } from './routers/client/dashboard'
import { leadsRouter     as clientLeadsRouter }     from './routers/client/leads'
import { callsRouter     as clientCallsRouter }     from './routers/client/calls'
import { roiRouter }                                from './routers/client/roi'
import { pipelineRouter  as clientPipelineRouter }  from './routers/client/pipeline'

export const appRouter = createTRPCRouter({
  admin: createTRPCRouter({
    trafego:      trafegoRouter,
    calls:        callsRouter,
    pipeline:     pipelineRouter,
    leads:        leadsRouter,
    clients:      clientsRouter,
    automations:  automationsRouter,
    integrations: integrationsRouter,
    dashboard:    dashboardRouter,
  }),
  portal: createTRPCRouter({
    dashboard: clientDashboardRouter,
    leads:     clientLeadsRouter,
    calls:     clientCallsRouter,
    roi:       roiRouter,
    pipeline:  clientPipelineRouter,
  }),
})

export type AppRouter = typeof appRouter
