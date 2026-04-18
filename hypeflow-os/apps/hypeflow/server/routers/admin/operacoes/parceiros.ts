import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

const PartnerTierEnum  = z.enum(['bronze', 'silver', 'gold', 'platinum'])
const PartnerStatusEnum = z.enum(['active', 'inactive', 'pending'])
const LeadStatusEnum    = z.enum(['referred', 'contacted', 'qualified', 'converted', 'lost'])

export const parceirosRouter = createTRPCRouter({

  /* ─────────────────── Listagem / Detalhes ─────────────────── */

  /** Lista todos os parceiros da agência */
  list: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      tier:     PartnerTierEnum.optional(),
      status:   PartnerStatusEnum.optional(),
      search:   z.string().optional(),
      page:     z.number().default(1),
      limit:    z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const offset = (input.page - 1) * input.limit

      let query = supabase
        .from('partners')
        .select('*, leads:partner_leads(count)', { count: 'exact' })
        .eq('agency_id', input.agencyId)

      if (input.tier)   query = query.eq('tier', input.tier)
      if (input.status) query = query.eq('status', input.status)
      if (input.search) query = query.ilike('name', `%${input.search}%`)

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) throw new Error(error.message)
      return { partners: data ?? [], total: count ?? 0 }
    }),

  /** Detalhes completos de um parceiro + leads */
  getById: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const [partnerResult, leadsResult] = await Promise.all([
        supabase
          .from('partners')
          .select('*')
          .eq('id', input.id)
          .single(),
        supabase
          .from('partner_leads')
          .select('*, lead:leads(id, full_name, score, temperature, pipeline_stage_id)')
          .eq('partner_id', input.id)
          .order('referred_at', { ascending: false }),
      ])

      if (partnerResult.error) throw new Error(partnerResult.error.message)
      return { partner: partnerResult.data, leads: leadsResult.data ?? [] }
    }),

  /* ─────────────────── CRUD ─────────────────── */

  /** Criar novo parceiro */
  create: agencyProcedure
    .input(z.object({
      agencyId:      z.string().uuid(),
      name:          z.string().min(2),
      email:         z.string().email(),
      phone:         z.string().optional(),
      company:       z.string().optional(),
      tier:          PartnerTierEnum.default('bronze'),
      commissionPct: z.number().min(0).max(100).default(10),
      notes:         z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      // Gerar código de referral único
      const refCode = `HP-${input.name.slice(0, 3).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

      const { data, error } = await supabase
        .from('partners')
        .insert({
          agency_id:      input.agencyId,
          name:           input.name,
          email:          input.email,
          phone:          input.phone,
          company:        input.company,
          tier:           input.tier,
          commission_pct: input.commissionPct,
          referral_code:  refCode,
          notes:          input.notes,
          status:         'active',
          total_leads:    0,
          converted_leads: 0,
          total_earned:   0,
          pending_commission: 0,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Actualizar dados do parceiro */
  update: agencyProcedure
    .input(z.object({
      id:            z.string().uuid(),
      name:          z.string().min(2).optional(),
      email:         z.string().email().optional(),
      phone:         z.string().optional(),
      company:       z.string().optional(),
      tier:          PartnerTierEnum.optional(),
      commissionPct: z.number().min(0).max(100).optional(),
      status:        PartnerStatusEnum.optional(),
      notes:         z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { id, commissionPct, ...rest } = input

      const { data, error } = await supabase
        .from('partners')
        .update({
          ...rest,
          ...(commissionPct !== undefined && { commission_pct: commissionPct }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ─────────────────── Leads do Parceiro ─────────────────── */

  /** Listar leads referenciados por um parceiro */
  listLeads: agencyProcedure
    .input(z.object({
      partnerId: z.string().uuid(),
      status:    LeadStatusEnum.optional(),
      limit:     z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('partner_leads')
        .select('*, lead:leads(id, full_name, score, temperature, pipeline_stage_id, source)')
        .eq('partner_id', input.partnerId)
        .order('referred_at', { ascending: false })
        .limit(input.limit)

      if (input.status) query = query.eq('status', input.status)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data ?? []
    }),

  /** Registar novo lead referenciado pelo parceiro */
  addLead: agencyProcedure
    .input(z.object({
      partnerId: z.string().uuid(),
      agencyId:  z.string().uuid(),
      leadId:    z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('partner_leads')
        .insert({
          partner_id:  input.partnerId,
          agency_id:   input.agencyId,
          lead_id:     input.leadId,
          status:      'referred',
          referred_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Incrementar total_leads no parceiro
      await supabase.rpc('increment_partner_leads', { p_partner_id: input.partnerId })

      return data
    }),

  /** Actualizar status de um lead do parceiro */
  updateLeadStatus: agencyProcedure
    .input(z.object({
      partnerLeadId: z.string().uuid(),
      status:        LeadStatusEnum,
      dealValue:     z.number().optional(), // para calcular comissão quando 'converted'
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('partner_leads')
        .update({
          status:       input.status,
          deal_value:   input.dealValue,
          converted_at: input.status === 'converted' ? new Date().toISOString() : null,
        })
        .eq('id', input.partnerLeadId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ─────────────────── Comissões ─────────────────── */

  /** Registar e processar comissão de um parceiro */
  processCommission: agencyProcedure
    .input(z.object({
      partnerId:     z.string().uuid(),
      partnerLeadId: z.string().uuid(),
      dealValue:     z.number().positive(),
      commissionPct: z.number().min(0).max(100),
      notes:         z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const amount = (input.dealValue * input.commissionPct) / 100

      const { data, error } = await supabase
        .from('partner_commissions')
        .insert({
          partner_id:      input.partnerId,
          partner_lead_id: input.partnerLeadId,
          deal_value:      input.dealValue,
          commission_pct:  input.commissionPct,
          amount,
          status:          'pending',
          notes:           input.notes,
          created_at:      new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Actualizar pending_commission no parceiro
      await supabase
        .from('partners')
        .update({
          pending_commission: supabase.rpc('add_pending_commission', { p_partner_id: input.partnerId, p_amount: amount }),
          converted_leads:    supabase.rpc('increment_converted_leads', { p_partner_id: input.partnerId }),
        })
        .eq('id', input.partnerId)

      return data
    }),

  /** Marcar comissão como paga */
  payCommission: agencyProcedure
    .input(z.object({
      commissionId: z.string().uuid(),
      partnerId:    z.string().uuid(),
      amount:       z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('partner_commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', input.commissionId)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Mover de pending → earned no parceiro
      await supabase
        .from('partners')
        .select('pending_commission, total_earned')
        .eq('id', input.partnerId)
        .single()
        .then(async ({ data: p }) => {
          if (!p) return
          await supabase
            .from('partners')
            .update({
              pending_commission: Math.max(0, (p.pending_commission ?? 0) - input.amount),
              total_earned:       (p.total_earned ?? 0) + input.amount,
            })
            .eq('id', input.partnerId)
        })

      return data
    }),

  /* ─────────────────── Stats ─────────────────── */

  /** KPIs globais de parceiros */
  getStats: agencyProcedure
    .input(z.object({ agencyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('partners')
        .select('tier, total_leads, converted_leads, total_earned, pending_commission')
        .eq('agency_id', input.agencyId)
        .eq('status', 'active')

      if (error) throw new Error(error.message)

      const rows = data ?? []
      return {
        total_partners:     rows.length,
        total_leads:        rows.reduce((s, r) => s + (r.total_leads ?? 0), 0),
        total_converted:    rows.reduce((s, r) => s + (r.converted_leads ?? 0), 0),
        total_earned:       rows.reduce((s, r) => s + (r.total_earned ?? 0), 0),
        pending_commission: rows.reduce((s, r) => s + (r.pending_commission ?? 0), 0),
        by_tier: {
          bronze:   rows.filter(r => r.tier === 'bronze').length,
          silver:   rows.filter(r => r.tier === 'silver').length,
          gold:     rows.filter(r => r.tier === 'gold').length,
          platinum: rows.filter(r => r.tier === 'platinum').length,
        },
      }
    }),
})
