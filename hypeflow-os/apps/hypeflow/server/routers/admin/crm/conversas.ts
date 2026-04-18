import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

export const conversasRouter = createTRPCRouter({
  /** Lista todas as conversas da agência, com filtros opcionais */
  list: agencyProcedure
    .input(z.object({
      agencyId:  z.string().uuid(),
      channel:   z.enum(['whatsapp', 'email', 'instagram', 'facebook', 'sms', 'chat']).optional(),
      status:    z.enum(['open', 'pending', 'closed']).optional(),
      assigneeId: z.string().uuid().optional(),
      search:    z.string().optional(),
      page:      z.number().default(1),
      limit:     z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx
      const offset = (input.page - 1) * input.limit

      let query = supabase
        .from('conversations')
        .select('*, lead:leads(id, full_name, score, temperature), assignee:users(id, full_name, avatar_url)', { count: 'exact' })
        .eq('agency_id', input.agencyId)

      if (input.channel)    query = query.eq('channel', input.channel)
      if (input.status)     query = query.eq('status', input.status)
      if (input.assigneeId) query = query.eq('assignee_id', input.assigneeId)
      if (input.search) {
        query = query.or(`subject.ilike.%${input.search}%,last_message.ilike.%${input.search}%`)
      }

      const { data, count, error } = await query
        .order('last_message_at', { ascending: false })
        .range(offset, offset + input.limit - 1)

      if (error) throw new Error(error.message)
      return { conversations: data ?? [], total: count ?? 0 }
    }),

  /** Detalhes de uma conversa + mensagens */
  getById: agencyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const [convResult, messagesResult] = await Promise.all([
        supabase
          .from('conversations')
          .select('*, lead:leads(id, full_name, score, temperature, pipeline_stage_id), assignee:users(id, full_name, avatar_url)')
          .eq('id', input.id)
          .single(),
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', input.id)
          .order('created_at', { ascending: true })
          .limit(200),
      ])

      if (convResult.error) throw new Error(convResult.error.message)
      return { conversation: convResult.data, messages: messagesResult.data ?? [] }
    }),

  /** Enviar uma mensagem numa conversa */
  send: agencyProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      agencyId:       z.string().uuid(),
      content:        z.string().min(1),
      channel:        z.enum(['whatsapp', 'email', 'instagram', 'facebook', 'sms', 'chat']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, agencyUser: user } = ctx

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: input.conversationId,
          agency_id:       input.agencyId,
          sender_id:       user.id,
          sender_type:     'agent',
          content:         input.content,
          channel:         input.channel,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Atualizar last_message_at na conversa
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString(), last_message: input.content })
        .eq('id', input.conversationId)

      return data
    }),

  /** Marcar conversa como lida */
  markRead: agencyProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { error } = await supabase
        .from('conversations')
        .update({ unread_count: 0, last_read_at: new Date().toISOString() })
        .eq('id', input.conversationId)

      if (error) throw new Error(error.message)
      return { success: true }
    }),

  /** Atribuir conversa a um agente */
  assign: agencyProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      assigneeId:     z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('conversations')
        .update({ assignee_id: input.assigneeId })
        .eq('id', input.conversationId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Fechar conversa */
  close: agencyProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('conversations')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', input.conversationId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),

  /** Reabrir conversa fechada */
  reopen: agencyProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('conversations')
        .update({ status: 'open', closed_at: null })
        .eq('id', input.conversationId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }),
})
