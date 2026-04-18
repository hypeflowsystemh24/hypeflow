import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

const CampaignStatusEnum  = z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'])
const CampaignChannelEnum = z.enum(['whatsapp', 'email', 'instagram', 'facebook', 'sms', 'multi'])
const CampaignTypeEnum    = z.enum(['broadcast', 'drip', 'nurture', 'retargeting', 'event'])

export const marketingRouter = createTRPCRouter({

  /* ─────────────────── Campanhas ─────────────────── */

  /** Lista todas as campanhas da agência */
  listCampaigns: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      status:   CampaignStatusEnum.optional(),
      channel:  CampaignChannelEnum.optional(),
      type:     CampaignTypeEnum.optional(),
      search:   z.string().optional(),
      page:     z.number().default(1),
      limit:    z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const offset = (input.page - 1) * input.limit

      let query = supabase
        .from('campaigns')
        .select('*', { count: 'exact' })
        .eq('agency_id', input.agencyId)

      if (input.status)  query = query.eq('status', input.status)
      if (input.channel) query = query.eq('channel', input.channel)
      if (input.type)    query = query.eq('type', input.type)
      if (input.search)  query = query.ilike('name', `%${input.search}%`)

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) throw new Error(error.message)
      return { campaigns: data ?? [], total: count ?? 0 }
    }),

  /** Detalhes de uma campanha + métricas */
  getCampaign: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const [campaignResult, metricsResult] = await Promise.all([
        supabase
          .from('campaigns')
          .select('*')
          .eq('id', input.id)
          .single(),
        supabase
          .from('campaign_metrics')
          .select('*')
          .eq('campaign_id', input.id)
          .order('date', { ascending: false })
          .limit(30),
      ])

      if (campaignResult.error) throw new Error(campaignResult.error.message)
      return { campaign: campaignResult.data, metrics: metricsResult.data ?? [] }
    }),

  /** Criar campanha */
  createCampaign: agencyProcedure
    .input(z.object({
      agencyId:    z.string().uuid(),
      name:        z.string().min(2),
      description: z.string().optional(),
      type:        CampaignTypeEnum,
      channel:     CampaignChannelEnum,
      audienceFilter: z.object({
        minScore:     z.number().optional(),
        maxScore:     z.number().optional(),
        temperature:  z.array(z.string()).optional(),
        stages:       z.array(z.string()).optional(),
        tags:         z.array(z.string()).optional(),
        sourceIds:    z.array(z.string()).optional(),
      }).optional(),
      content:       z.any().optional(), // template / copy
      scheduledAt:   z.string().optional(), // ISO
      endsAt:        z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          agency_id:       input.agencyId,
          name:            input.name,
          description:     input.description,
          type:            input.type,
          channel:         input.channel,
          audience_filter: input.audienceFilter,
          content:         input.content,
          scheduled_at:    input.scheduledAt,
          ends_at:         input.endsAt,
          status:          'draft',
          sent:            0,
          opened:          0,
          clicked:         0,
          converted:       0,
          unsubscribed:    0,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Actualizar campanha */
  updateCampaign: agencyProcedure
    .input(z.object({
      id:          z.string().uuid(),
      name:        z.string().min(2).optional(),
      description: z.string().optional(),
      status:      CampaignStatusEnum.optional(),
      scheduledAt: z.string().optional(),
      endsAt:      z.string().optional(),
      content:     z.any().optional(),
      audienceFilter: z.object({
        minScore:    z.number().optional(),
        maxScore:    z.number().optional(),
        temperature: z.array(z.string()).optional(),
        stages:      z.array(z.string()).optional(),
        tags:        z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { id, scheduledAt, endsAt, audienceFilter, ...rest } = input

      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...rest,
          ...(scheduledAt   !== undefined && { scheduled_at: scheduledAt }),
          ...(endsAt        !== undefined && { ends_at: endsAt }),
          ...(audienceFilter !== undefined && { audience_filter: audienceFilter }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ─────────────────── Funil por Canal ─────────────────── */

  /** Relatório de funil de conversão por canal */
  getChannelFunnel: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      period:   z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const days  = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
      const since = new Date(Date.now() - days * 86400000).toISOString()

      const { data, error } = await supabase
        .from('campaign_metrics_summary')
        .select('channel, sent, opened, clicked, converted, revenue')
        .eq('agency_id', input.agencyId)
        .gte('date', since)

      if (error) throw new Error(error.message)

      // Agregar por canal
      const byChannel = new Map<string, { sent: number; opened: number; clicked: number; converted: number; revenue: number }>()
      for (const row of data ?? []) {
        const cur = byChannel.get(row.channel) ?? { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 }
        byChannel.set(row.channel, {
          sent:      cur.sent      + (row.sent      ?? 0),
          opened:    cur.opened    + (row.opened    ?? 0),
          clicked:   cur.clicked   + (row.clicked   ?? 0),
          converted: cur.converted + (row.converted ?? 0),
          revenue:   cur.revenue   + (row.revenue   ?? 0),
        })
      }

      return Array.from(byChannel.entries()).map(([channel, stats]) => ({
        channel,
        ...stats,
        open_rate:    stats.sent > 0 ? +(stats.opened    / stats.sent * 100).toFixed(1) : 0,
        click_rate:   stats.sent > 0 ? +(stats.clicked   / stats.sent * 100).toFixed(1) : 0,
        convert_rate: stats.sent > 0 ? +(stats.converted / stats.sent * 100).toFixed(1) : 0,
      }))
    }),

  /* ─────────────────── Audiências ─────────────────── */

  /** Calcular tamanho da audiência com base nos filtros */
  estimateAudience: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      filter: z.object({
        minScore:    z.number().optional(),
        maxScore:    z.number().optional(),
        temperature: z.array(z.string()).optional(),
        stages:      z.array(z.string()).optional(),
        tags:        z.array(z.string()).optional(),
      }),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('agency_id', input.agencyId)
        .eq('status', 'active')

      const f = input.filter
      if (f.minScore    !== undefined) query = query.gte('score', f.minScore)
      if (f.maxScore    !== undefined) query = query.lte('score', f.maxScore)
      if (f.temperature?.length)       query = query.in('temperature', f.temperature)
      if (f.stages?.length)            query = query.in('pipeline_stage_id', f.stages)

      const { count, error } = await query
      if (error) throw new Error(error.message)
      return { count: count ?? 0 }
    }),

  /* ─────────────────── Templates de Mensagem ─────────────────── */

  /** Lista templates de mensagem disponíveis */
  listTemplates: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      channel:  CampaignChannelEnum.optional(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('agency_id', input.agencyId)

      if (input.channel)  query = query.eq('channel', input.channel)
      if (input.category) query = query.eq('category', input.category)

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data ?? []
    }),

  /** Criar template de mensagem */
  createTemplate: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      name:     z.string().min(2),
      channel:  CampaignChannelEnum,
      category: z.string().optional(),
      subject:  z.string().optional(), // para email
      body:     z.string().min(1),
      variables: z.array(z.string()).default([]), // ex: ['{{first_name}}', '{{company}}']
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          agency_id: input.agencyId,
          name:      input.name,
          channel:   input.channel,
          category:  input.category,
          subject:   input.subject,
          body:      input.body,
          variables: input.variables,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ─────────────────── Dashboard de Marketing ─────────────────── */

  /** KPIs globais de marketing */
  getDashboard: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      period:   z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const days  = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
      const since = new Date(Date.now() - days * 86400000).toISOString()

      const [campaignsResult, leadsResult] = await Promise.all([
        supabase
          .from('campaigns')
          .select('status, sent, opened, clicked, converted')
          .eq('agency_id', input.agencyId),
        supabase
          .from('leads')
          .select('id, created_at, source')
          .eq('agency_id', input.agencyId)
          .gte('created_at', since),
      ])

      const campaigns = campaignsResult.data ?? []
      const leads     = leadsResult.data ?? []

      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      const totalSent       = campaigns.reduce((s, c) => s + (c.sent      ?? 0), 0)
      const totalOpened     = campaigns.reduce((s, c) => s + (c.opened    ?? 0), 0)
      const totalClicked    = campaigns.reduce((s, c) => s + (c.clicked   ?? 0), 0)
      const totalConverted  = campaigns.reduce((s, c) => s + (c.converted ?? 0), 0)

      // Leads por fonte no período
      const bySource = new Map<string, number>()
      for (const l of leads) {
        bySource.set(l.source ?? 'unknown', (bySource.get(l.source ?? 'unknown') ?? 0) + 1)
      }

      return {
        active_campaigns: activeCampaigns,
        total_sent:       totalSent,
        open_rate:        totalSent > 0 ? +(totalOpened   / totalSent * 100).toFixed(1) : 0,
        click_rate:       totalSent > 0 ? +(totalClicked  / totalSent * 100).toFixed(1) : 0,
        convert_rate:     totalSent > 0 ? +(totalConverted / totalSent * 100).toFixed(1) : 0,
        new_leads:        leads.length,
        leads_by_source:  Object.fromEntries(bySource),
      }
    }),
})
