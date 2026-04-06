import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * N8N / Make inbound action endpoint
 * N8N or Make workflows call this to update data in HYPE Flow OS
 *
 * Auth: Bearer token (API_SECRET_KEY env var)
 */

const ALLOWED_ACTIONS = [
  'update_lead',
  'move_stage',
  'assign_agent',
  'add_tag',
  'create_call',
  'send_notification',
] as const

type AllowedAction = typeof ALLOWED_ACTIONS[number]

interface ActionPayload {
  action: AllowedAction
  lead_id?: string
  data?: Record<string, unknown>
}

function verifyAuth(req: NextRequest): boolean {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return false
  return auth.slice(7) === process.env.API_SECRET_KEY
}

export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ActionPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.action || !ALLOWED_ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` }, { status: 400 })
  }

  const supabase = await createServiceClient()

  try {
    switch (body.action) {
      case 'update_lead': {
        if (!body.lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 })
        const allowed = ['status', 'score', 'temperature', 'tags', 'notes', 'agent_id']
        const updates = Object.fromEntries(
          Object.entries(body.data ?? {}).filter(([k]) => allowed.includes(k))
        )
        const { error } = await supabase.from('leads').update(updates).eq('id', body.lead_id)
        if (error) throw error
        return NextResponse.json({ success: true, action: 'update_lead', lead_id: body.lead_id })
      }

      case 'move_stage': {
        if (!body.lead_id || !body.data?.stage_id)
          return NextResponse.json({ error: 'lead_id and data.stage_id required' }, { status: 400 })
        const { error } = await supabase
          .from('leads')
          .update({ pipeline_stage_id: body.data.stage_id, stage_entered_at: new Date().toISOString() })
          .eq('id', body.lead_id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'assign_agent': {
        if (!body.lead_id || !body.data?.agent_id)
          return NextResponse.json({ error: 'lead_id and data.agent_id required' }, { status: 400 })
        const { error } = await supabase
          .from('leads')
          .update({ agent_id: body.data.agent_id })
          .eq('id', body.lead_id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'add_tag': {
        if (!body.lead_id || !body.data?.tag)
          return NextResponse.json({ error: 'lead_id and data.tag required' }, { status: 400 })
        const { data: lead } = await supabase.from('leads').select('tags').eq('id', body.lead_id).single()
        const tags = [...new Set([...(lead?.tags ?? []), body.data.tag as string])]
        const { error } = await supabase.from('leads').update({ tags }).eq('id', body.lead_id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'create_call': {
        const required = ['lead_id', 'client_id', 'agency_id', 'scheduled_at']
        const missing = required.filter(k => !body.data?.[k])
        if (missing.length)
          return NextResponse.json({ error: `Missing: ${missing.join(', ')}` }, { status: 400 })
        const { error, data } = await supabase.from('calls').insert({
          lead_id: body.data!.lead_id as string,
          client_id: body.data!.client_id as string,
          agency_id: body.data!.agency_id as string,
          agent_id: body.data!.agent_id as string ?? null,
          scheduled_at: body.data!.scheduled_at as string,
          duration_min: (body.data!.duration_min as number) ?? 45,
          status: 'scheduled',
          notes: body.data!.notes as string ?? null,
        }).select().single()
        if (error) throw error
        return NextResponse.json({ success: true, call: data })
      }

      default:
        return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
    }
  } catch (err) {
    console.error(`[n8n-actions] ${body.action} failed:`, err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
