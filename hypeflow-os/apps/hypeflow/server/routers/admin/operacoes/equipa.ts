import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

export const equipaRouter = createTRPCRouter({

  /* ─────────────────── Actividade ─────────────────── */

  /** Métricas de actividade de todos os membros no período */
  getActivity: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      period:   z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const days   = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
      const since  = new Date(Date.now() - days * 86400000).toISOString()

      const [usersResult, callsResult, interactionsResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, full_name, avatar_url, role')
          .eq('agency_id', input.agencyId)
          .eq('is_active', true),
        supabase
          .from('calls')
          .select('agent_id, status, scheduled_at')
          .eq('agency_id', input.agencyId)
          .gte('scheduled_at', since),
        supabase
          .from('lead_interactions')
          .select('user_id, type, created_at')
          .eq('agency_id', input.agencyId)
          .gte('created_at', since),
      ])

      if (usersResult.error) throw new Error(usersResult.error.message)

      const callsByAgent        = new Map<string, number>()
      const msgsByAgent         = new Map<string, number>()

      for (const c of callsResult.data ?? []) {
        callsByAgent.set(c.agent_id, (callsByAgent.get(c.agent_id) ?? 0) + 1)
      }
      for (const i of interactionsResult.data ?? []) {
        if (i.type === 'whatsapp' || i.type === 'email') {
          msgsByAgent.set(i.user_id, (msgsByAgent.get(i.user_id) ?? 0) + 1)
        }
      }

      return (usersResult.data ?? []).map(u => ({
        id:            u.id,
        name:          u.full_name,
        avatar_url:    u.avatar_url,
        role:          u.role,
        calls_made:    callsByAgent.get(u.id)  ?? 0,
        messages_sent: msgsByAgent.get(u.id)   ?? 0,
      }))
    }),

  /** Actividade detalhada de um membro específico */
  getMemberActivity: agencyProcedure
    .input(z.object({
      memberId: z.string().uuid(),
      agencyId: z.string().uuid(),
      period:   z.enum(['7d', '30d', '90d']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const days  = input.period === '7d' ? 7 : input.period === '30d' ? 30 : 90
      const since = new Date(Date.now() - days * 86400000).toISOString()

      const [userResult, callsResult, interactionsResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, full_name, avatar_url, role')
          .eq('id', input.memberId)
          .single(),
        supabase
          .from('calls')
          .select('status, scheduled_at, lead_id')
          .eq('agent_id', input.memberId)
          .gte('scheduled_at', since)
          .order('scheduled_at', { ascending: false }),
        supabase
          .from('lead_interactions')
          .select('type, created_at, outcome, lead_id')
          .eq('user_id', input.memberId)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      if (userResult.error) throw new Error(userResult.error.message)

      return {
        member:       userResult.data,
        calls:        callsResult.data    ?? [],
        interactions: interactionsResult.data ?? [],
      }
    }),

  /* ─────────────────── Check-ins ─────────────────── */

  /** Lista check-ins do período */
  listCheckIns: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      date:     z.string().optional(), // ISO date string
      limit:    z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('checkins')
        .select('*, member:users(id, full_name, avatar_url)', { count: 'exact' })
        .eq('agency_id', input.agencyId)
        .order('submitted_at', { ascending: false })
        .limit(input.limit)

      if (input.date) {
        const start = new Date(input.date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(input.date)
        end.setHours(23, 59, 59, 999)
        query = query.gte('submitted_at', start.toISOString()).lte('submitted_at', end.toISOString())
      }

      const { data, count, error } = await query
      if (error) throw new Error(error.message)
      return { checkins: data ?? [], total: count ?? 0 }
    }),

  /** Enviar check-in para toda a equipa (trigger manual) */
  sendCheckIn: agencyProcedure
    .input(z.object({
      agencyId:  z.string().uuid(),
      questions: z.array(z.object({ id: z.string(), text: z.string() })),
      memberIds: z.array(z.string().uuid()),
      channel:   z.enum(['whatsapp', 'email', 'platform']).default('platform'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const rows = input.memberIds.map(memberId => ({
        agency_id:  input.agencyId,
        member_id:  memberId,
        questions:  input.questions,
        channel:    input.channel,
        status:     'pending',
        sent_at:    new Date().toISOString(),
      }))

      const { data, error } = await supabase
        .from('checkins')
        .insert(rows)
        .select()

      if (error) throw new Error(error.message)
      return { sent: data?.length ?? 0 }
    }),

  /** Submeter resposta de um check-in */
  submitResponse: agencyProcedure
    .input(z.object({
      checkinId: z.string().uuid(),
      answers:   z.array(z.object({ questionId: z.string(), answer: z.string() })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, agencyUser: user } = ctx

      const { data, error } = await supabase
        .from('checkins')
        .update({
          answers:      input.answers,
          status:       'submitted',
          submitted_at: new Date().toISOString(),
          member_id:    user.id,
        })
        .eq('id', input.checkinId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ─────────────────── Gamificação ─────────────────── */

  /** Leaderboard da equipa */
  getLeaderboard: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      sort:     z.enum(['xp', 'deals', 'calls', 'score']).default('xp'),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('member_gamification')
        .select('*, member:users(id, full_name, avatar_url, role)')
        .eq('agency_id', input.agencyId)
        .order(input.sort === 'xp' ? 'xp_total' : input.sort === 'deals' ? 'deals_closed' : input.sort === 'calls' ? 'calls_made' : 'score_avg', { ascending: false })

      if (error) throw new Error(error.message)
      return data ?? []
    }),

  /** Atribuir badge a um membro */
  awardBadge: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      memberId: z.string().uuid(),
      badgeId:  z.string(),
      reason:   z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('member_badges')
        .insert({
          agency_id:  input.agencyId,
          member_id:  input.memberId,
          badge_id:   input.badgeId,
          reason:     input.reason,
          awarded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Adicionar XP a um membro */
  updateXp: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      memberId: z.string().uuid(),
      xpDelta:  z.number(),
      reason:   z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      // Buscar XP actual
      const { data: current } = await supabase
        .from('member_gamification')
        .select('xp_total')
        .eq('member_id', input.memberId)
        .eq('agency_id', input.agencyId)
        .single()

      const newXp = Math.max(0, (current?.xp_total ?? 0) + input.xpDelta)

      const { data, error } = await supabase
        .from('member_gamification')
        .upsert({
          agency_id:  input.agencyId,
          member_id:  input.memberId,
          xp_total:   newXp,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'member_id, agency_id' })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),
})
