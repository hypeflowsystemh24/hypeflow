import { z } from 'zod'
import { createTRPCRouter, agencyProcedure } from '../../../trpc'

/* ─── Schemas ─── */

const EmailSettingsSchema = z.object({
  resend_api_key: z.string(),
  from_email:     z.string().email().optional(),
  from_name:      z.string().optional(),
})

const WhatsappSettingsSchema = z.object({
  access_token:    z.string(),
  phone_number_id: z.string(),
  webhook_verify:  z.string().optional(),
})

/* ─── Router ─── */

export const settingsRouter = createTRPCRouter({

  /* ── Get all integration settings ── */
  get: agencyProcedure
    .input(z.object({ agencyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { data, error } = await supabase
        .from('agency_settings')
        .select('key, value')
        .eq('agency_id', input.agencyId)
        .in('key', ['email_config', 'whatsapp_config', 'google_calendar_config'])

      if (error) return { email: null, whatsapp: null, google_calendar: null }

      const byKey = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
      return {
        email:           byKey['email_config']           ?? null,
        whatsapp:        byKey['whatsapp_config']        ?? null,
        google_calendar: byKey['google_calendar_config'] ?? null,
      }
    }),

  /* ── Save email settings ── */
  saveEmail: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      settings: EmailSettingsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { error } = await supabase
        .from('agency_settings')
        .upsert({
          agency_id:  input.agencyId,
          key:        'email_config',
          value:      input.settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'agency_id,key' })

      if (error) throw new Error(error.message)
      return { ok: true }
    }),

  /* ── Save WhatsApp settings ── */
  saveWhatsapp: agencyProcedure
    .input(z.object({
      agencyId: z.string().uuid(),
      settings: WhatsappSettingsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx

      const { error } = await supabase
        .from('agency_settings')
        .upsert({
          agency_id:  input.agencyId,
          key:        'whatsapp_config',
          value:      input.settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'agency_id,key' })

      if (error) throw new Error(error.message)
      return { ok: true }
    }),

  /* ── Disconnect integration ── */
  disconnect: agencyProcedure
    .input(z.object({
      agencyId:    z.string().uuid(),
      integration: z.enum(['email', 'whatsapp', 'google_calendar']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase } = ctx
      const keyMap = {
        email:           'email_config',
        whatsapp:        'whatsapp_config',
        google_calendar: 'google_calendar_config',
      }
      const { error } = await supabase
        .from('agency_settings')
        .delete()
        .eq('agency_id', input.agencyId)
        .eq('key', keyMap[input.integration])

      if (error) throw new Error(error.message)
      return { ok: true }
    }),
})
