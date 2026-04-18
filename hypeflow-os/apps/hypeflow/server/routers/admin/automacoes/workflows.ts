import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

/* ─────────────── Schemas ─────────────── */

const WorkflowStatusEnum = z.enum(['draft', 'active', 'paused'])

const NodeConfigSchema = z.record(z.string(), z.any())

const WorkflowNodeSchema = z.object({
  id:       z.string(),
  type:     z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label:  z.string(),
    config: NodeConfigSchema,
    valid:  z.boolean().optional(),
  }),
})

const WorkflowEdgeSchema = z.object({
  id:      z.string(),
  source:  z.string(),
  target:  z.string(),
  label:   z.string().optional(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
})

/* ─────────────── Router ─────────────── */

export const workflowsRouter = createTRPCRouter({

  /* ── Listagem ── */

  list: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      status:   WorkflowStatusEnum.optional(),
      search:   z.string().optional(),
      page:     z.number().default(1),
      limit:    z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const offset = (input.page - 1) * input.limit

      let query = supabase
        .from('workflows')
        .select('id, name, status, created_at, updated_at, created_by', { count: 'exact' })
        .eq('agency_id', input.agencyId)

      if (input.status) query = query.eq('status', input.status)
      if (input.search) query = query.ilike('name', `%${input.search}%`)

      const { data, count, error } = await query
        .order('updated_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) throw new Error(error.message)
      return { workflows: data ?? [], total: count ?? 0 }
    }),

  /* ── Detalhes (com nodes + edges) ── */

  getById: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Criar ── */

  create: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      name:     z.string().min(1),
      nodes:    z.array(WorkflowNodeSchema).default([]),
      edges:    z.array(WorkflowEdgeSchema).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, agencyUser: user } = ctx

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          agency_id:  input.agencyId,
          name:       input.name,
          status:     'draft',
          nodes:      input.nodes,
          edges:      input.edges,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Guardar (auto-save) ── */

  save: agencyProcedure
    .input(z.object({
      id:    z.string().uuid(),
      name:  z.string().min(1).optional(),
      nodes: z.array(WorkflowNodeSchema),
      edges: z.array(WorkflowEdgeSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('workflows')
        .update({
          ...(input.name && { name: input.name }),
          nodes:      input.nodes,
          edges:      input.edges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Publicar ── */

  publish: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      // Buscar workflow para validar antes de publicar
      const { data: wf } = await supabase
        .from('workflows')
        .select('nodes, edges')
        .eq('id', input.id)
        .single()

      if (!wf) throw new Error('Workflow não encontrado.')

      const nodes: { type: string }[] = wf.nodes ?? []
      const hasTrigger = nodes.some(n => n.type === 'trigger')
      if (!hasTrigger) throw new Error('O workflow precisa de pelo menos um trigger.')

      const { data, error } = await supabase
        .from('workflows')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Pausar ── */

  pause: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('workflows')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Duplicar ── */

  duplicate: agencyProcedure
    .input(z.object({ id: z.string().uuid(), agencyId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, agencyUser: user } = ctx

      const { data: original } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', input.id)
        .single()

      if (!original) throw new Error('Workflow não encontrado.')

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          agency_id:  input.agencyId,
          name:       `${original.name} (cópia)`,
          status:     'draft',
          nodes:      original.nodes,
          edges:      original.edges,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /* ── Eliminar ── */

  delete: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', input.id)

      if (error) throw new Error(error.message)
      return { success: true }
    }),

  /* ── Runs ── */

  listRuns: agencyProcedure
    .input(z.object({
      workflowId: z.string().uuid(),
      status:     z.enum(['running', 'completed', 'failed']).optional(),
      limit:      z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      let query = supabase
        .from('workflow_runs')
        .select('*')
        .eq('workflow_id', input.workflowId)
        .order('started_at', { ascending: false })
        .limit(input.limit)

      if (input.status) query = query.eq('status', input.status)

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data ?? []
    }),

  /* ── Logs de um run ── */

  getRunLogs: agencyProcedure
    .input(z.object({ runId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('workflow_logs')
        .select('*')
        .eq('run_id', input.runId)
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return data ?? []
    }),

  /* ── Stats ── */

  getStats: agencyProcedure
    .input(z.object({ agencyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('workflows')
        .select('status')
        .eq('agency_id', input.agencyId)

      if (error) throw new Error(error.message)

      const rows = data ?? []
      return {
        total:  rows.length,
        active: rows.filter(r => r.status === 'active').length,
        draft:  rows.filter(r => r.status === 'draft').length,
        paused: rows.filter(r => r.status === 'paused').length,
      }
    }),
})
