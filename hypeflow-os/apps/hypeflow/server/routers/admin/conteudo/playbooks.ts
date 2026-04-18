import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

const PlaybookCategoryEnum = z.enum(['nurturing', 'conversion', 'reactivation', 'onboarding', 'retention'])
const PlaybookStatusEnum   = z.enum(['active', 'inactive', 'draft'])
const StepChannelEnum      = z.enum(['whatsapp', 'email', 'call', 'meeting', 'tag', 'task', 'wait'])

export const playbooksRouter = createTRPCRouter({

  /* ─────────────────── Listagem / Detalhes ─────────────────── */

  /** Lista todos os playbooks da agência */
  list: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      category: PlaybookCategoryEnum.optional(),
      status:   PlaybookStatusEnum.optional(),
      search:   z.string().optional(),
      page:     z.number().default(1),
      limit:    z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const offset = (input.page - 1) * input.limit

      let query = supabase
        .from('playbooks')
        .select('*', { count: 'exact' })
        .eq('agency_id', input.agencyId)

      if (input.category) query = query.eq('category', input.category)
      if (input.status)   query = query.eq('status', input.status)
      if (input.search)   query = query.ilike('name', `%${input.search}%`)

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) throw new Error(error.message)
      return { playbooks: data ?? [], total: count ?? 0 }
    }),

  /** Detalhes completos de um playbook (com passos) */
  getById: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const [playbookResult, stepsResult] = await Promise.all([
        supabase
          .from('playbooks')
          .select('*')
          .eq('id', input.id)
          .single(),
        supabase
          .from('playbook_steps')
          .select('*')
          .eq('playbook_id', input.id)
          .order('position', { ascending: true }),
      ])

      if (playbookResult.error) throw new Error(playbookResult.error.message)
      return { playbook: playbookResult.data, steps: stepsResult.data ?? [] }
    }),

  /* ─────────────────── CRUD ─────────────────── */

  /** Criar novo playbook */
  create: agencyProcedure
    .input(z.object({
      agencyId:    z.string().uuid(),
      name:        z.string().min(2),
      description: z.string().optional(),
      category:    PlaybookCategoryEnum,
      triggerType: z.string().optional(), // 'score_threshold', 'stage_change', 'manual', etc.
      triggerValue: z.any().optional(),
      steps: z.array(z.object({
        position:    z.number(),
        day:         z.number(),
        channel:     StepChannelEnum,
        action:      z.string(),
        content:     z.string().optional(),
        config:      z.any().optional(),
      })).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { steps, ...playbookData } = input

      const { data: playbook, error: playbookError } = await supabase
        .from('playbooks')
        .insert({
          agency_id:     playbookData.agencyId,
          name:          playbookData.name,
          description:   playbookData.description,
          category:      playbookData.category,
          trigger_type:  playbookData.triggerType,
          trigger_value: playbookData.triggerValue,
          status:        'draft',
          leads_active:  0,
          leads_completed: 0,
          conversion_rate: 0,
        })
        .select()
        .single()

      if (playbookError) throw new Error(playbookError.message)

      // Inserir passos se fornecidos
      if (steps.length > 0) {
        const stepRows = steps.map(s => ({
          playbook_id: playbook.id,
          agency_id:   input.agencyId,
          position:    s.position,
          day:         s.day,
          channel:     s.channel,
          action:      s.action,
          content:     s.content,
          config:      s.config,
        }))
        await supabase.from('playbook_steps').insert(stepRows)
      }

      return playbook
    }),

  /** Actualizar playbook */
  update: agencyProcedure
    .input(z.object({
      id:          z.string().uuid(),
      name:        z.string().min(2).optional(),
      description: z.string().optional(),
      category:    PlaybookCategoryEnum.optional(),
      status:      PlaybookStatusEnum.optional(),
      triggerType: z.string().optional(),
      triggerValue: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { id, triggerType, triggerValue, ...rest } = input

      const { data, error } = await supabase
        .from('playbooks')
        .update({
          ...rest,
          ...(triggerType  !== undefined && { trigger_type: triggerType }),
          ...(triggerValue !== undefined && { trigger_value: triggerValue }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Eliminar playbook (só se não tiver leads activos) */
  delete: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      // Verificar se tem leads activos
      const { data: playbook } = await supabase
        .from('playbooks')
        .select('leads_active')
        .eq('id', input.id)
        .single()

      if (playbook?.leads_active && playbook.leads_active > 0) {
        throw new Error('Não é possível eliminar um playbook com leads activos.')
      }

      const { error } = await supabase
        .from('playbooks')
        .delete()
        .eq('id', input.id)

      if (error) throw new Error(error.message)
      return { success: true }
    }),

  /* ─────────────────── Passos ─────────────────── */

  /** Adicionar passo ao playbook */
  addStep: agencyProcedure
    .input(z.object({
      playbookId: z.string().uuid(),
      agencyId:   z.string().uuid(),
      position:   z.number(),
      day:        z.number(),
      channel:    StepChannelEnum,
      action:     z.string(),
      content:    z.string().optional(),
      config:     z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      // Deslocar posições existentes
      await supabase.rpc('shift_playbook_steps', {
        p_playbook_id: input.playbookId,
        p_from_position: input.position,
      })

      const { data, error } = await supabase
        .from('playbook_steps')
        .insert({
          playbook_id: input.playbookId,
          agency_id:   input.agencyId,
          position:    input.position,
          day:         input.day,
          channel:     input.channel,
          action:      input.action,
          content:     input.content,
          config:      input.config,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Actualizar passo */
  updateStep: agencyProcedure
    .input(z.object({
      stepId:  z.string().uuid(),
      day:     z.number().optional(),
      channel: StepChannelEnum.optional(),
      action:  z.string().optional(),
      content: z.string().optional(),
      config:  z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const { stepId, ...fields } = input

      const { data, error } = await supabase
        .from('playbook_steps')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', stepId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Remover passo */
  removeStep: agencyProcedure
    .input(z.object({ stepId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { error } = await supabase
        .from('playbook_steps')
        .delete()
        .eq('id', input.stepId)

      if (error) throw new Error(error.message)
      return { success: true }
    }),

  /* ─────────────────── Execução ─────────────────── */

  /** Activar playbook (muda status para 'active') */
  activate: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('playbooks')
        .update({ status: 'active', activated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Desactivar playbook */
  deactivate: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('playbooks')
        .update({ status: 'inactive' })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Atribuir playbook a um lead */
  enrollLead: agencyProcedure
    .input(z.object({
      playbookId: z.string().uuid(),
      agencyId:   z.string().uuid(),
      leadId:     z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('playbook_enrollments')
        .insert({
          playbook_id:  input.playbookId,
          agency_id:    input.agencyId,
          lead_id:      input.leadId,
          status:       'active',
          current_step: 0,
          enrolled_at:  new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Incrementar leads_active
      await supabase.rpc('increment_playbook_active', { p_playbook_id: input.playbookId })

      return data
    }),

  /** Listar leads inscritos num playbook */
  listEnrollments: agencyProcedure
    .input(z.object({
      playbookId: z.string().uuid(),
      status:     z.enum(['active', 'completed', 'paused', 'dropped']).optional(),
      limit:      z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('playbook_enrollments')
        .select('*, lead:leads(id, full_name, score, temperature)')
        .eq('playbook_id', input.playbookId)
        .order('enrolled_at', { ascending: false })
        .limit(input.limit)

      if (input.status) query = query.eq('status', input.status)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data ?? []
    }),
})
