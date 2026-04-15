import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/* ─── GHL event types ─── */
type GHLEventType =
  | 'contact.created'
  | 'contact.updated'
  | 'opportunity.created'
  | 'opportunity.updated'
  | 'opportunity.stage_changed'
  | 'appointment.booked'
  | 'form.submitted'

interface GHLContact {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  companyName?: string
  tags?: string[]
  source?: string
  customFields?: Array<{ id: string; value: string }>
}

interface GHLOpportunity {
  id: string
  name?: string
  pipelineStageId?: string
  monetaryValue?: number
  contact?: GHLContact
}

interface GHLWebhookPayload {
  type: GHLEventType
  locationId: string
  contact?: GHLContact
  opportunity?: GHLOpportunity
  appointment?: {
    id: string
    contactId: string
    startTime: string
    status: string
  }
  formData?: Record<string, string>
  timestamp?: string
}

/* ─── Verify signature ─── */
function verifySecret(req: NextRequest): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret) return true // skip verification if not configured
  const header = req.headers.get('x-ghl-signature') ?? req.headers.get('authorization')
  return header === secret || header === `Bearer ${secret}`
}

/* ─── Map GHL source → internal source ─── */
function mapSource(ghlSource?: string): string {
  const s = (ghlSource ?? '').toLowerCase()
  if (s.includes('facebook') || s.includes('meta') || s.includes('fb')) return 'meta'
  if (s.includes('instagram') || s.includes('ig'))                       return 'instagram'
  if (s.includes('google'))                                               return 'google_ads'
  if (s.includes('linkedin'))                                             return 'linkedin'
  if (s.includes('whatsapp') || s.includes('wa'))                        return 'whatsapp'
  if (s.includes('tiktok'))                                               return 'tiktok'
  return 'organic'
}

/* ─── Handlers ─── */

async function handleContactCreated(
  payload: GHLWebhookPayload,
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  agencyId: string
) {
  const c = payload.contact
  if (!c) return { skipped: 'no contact' }

  const full_name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'
  const { error } = await supabase.from('leads').insert({
    agency_id:   agencyId,
    full_name,
    email:       c.email ?? null,
    phone:       c.phone ?? null,
    company:     c.companyName ?? null,
    source:      mapSource(c.source),
    source_type: 'paid',
    status:      'active',
    score:       0,
    tags:        c.tags ?? [],
    ghl_contact_id: c.id,
    created_at:  payload.timestamp ?? new Date().toISOString(),
    updated_at:  new Date().toISOString(),
  })

  if (error) {
    // If unique constraint on ghl_contact_id, update instead
    if (error.code === '23505') {
      await supabase.from('leads')
        .update({ full_name, email: c.email ?? null, phone: c.phone ?? null, updated_at: new Date().toISOString() })
        .eq('ghl_contact_id', c.id)
        .eq('agency_id', agencyId)
    } else {
      console.error('[GHL webhook] insert error:', error.message)
    }
  }

  return { processed: 'contact.created', ghl_id: c.id }
}

async function handleOpportunityStageChanged(
  payload: GHLWebhookPayload,
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  agencyId: string
) {
  const opp = payload.opportunity
  if (!opp?.contact?.id || !opp.pipelineStageId) return { skipped: 'missing fields' }

  // Find the matching pipeline stage by ghl_stage_id
  const { data: stage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('agency_id', agencyId)
    .eq('ghl_stage_id', opp.pipelineStageId)
    .maybeSingle()

  if (!stage) return { skipped: 'stage not mapped', ghl_stage_id: opp.pipelineStageId }

  await supabase.from('leads')
    .update({
      pipeline_stage_id: stage.id,
      stage_entered_at:  new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    })
    .eq('ghl_contact_id', opp.contact.id)
    .eq('agency_id', agencyId)

  return { processed: 'opportunity.stage_changed', stage_id: stage.id }
}

async function handleFormSubmitted(
  payload: GHLWebhookPayload,
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  agencyId: string
) {
  const c = payload.contact
  if (!c?.id) return { skipped: 'no contact id' }

  const notes = payload.formData
    ? Object.entries(payload.formData).map(([k, v]) => `${k}: ${v}`).join('\n')
    : null

  if (notes) {
    await supabase.from('lead_interactions').insert({
      lead_ghl_contact_id: c.id,
      agency_id:  agencyId,
      type:       'form_submission',
      content:    notes,
      created_at: payload.timestamp ?? new Date().toISOString(),
    })
  }

  return { processed: 'form.submitted' }
}

async function resolveAgencyId(locationId: string, supabase: Awaited<ReturnType<typeof createServiceClient>>): Promise<string | null> {
  const { data } = await supabase
    .from('agency_integrations')
    .select('agency_id')
    .eq('provider', 'ghl')
    .eq('external_id', locationId)
    .maybeSingle()
  return data?.agency_id ?? null
}

/* ─── Main handler ─── */

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: GHLWebhookPayload
  try {
    payload = await req.json() as GHLWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.type || !payload.locationId) {
    return NextResponse.json({ error: 'Missing type or locationId' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Resolve agency from GHL locationId
  const agencyId = await resolveAgencyId(payload.locationId, supabase)
  if (!agencyId) {
    // Log unknown location but return 200 so GHL doesn't retry
    console.warn('[GHL webhook] unknown locationId:', payload.locationId)
    return NextResponse.json({ received: true, skipped: 'unknown location' })
  }

  let result: Record<string, unknown>

  switch (payload.type) {
    case 'contact.created':
    case 'contact.updated':
      result = await handleContactCreated(payload, supabase, agencyId)
      break

    case 'opportunity.stage_changed':
    case 'opportunity.updated':
      result = await handleOpportunityStageChanged(payload, supabase, agencyId)
      break

    case 'form.submitted':
      result = await handleFormSubmitted(payload, supabase, agencyId)
      break

    case 'appointment.booked':
      // Acknowledged — scheduling integration handled separately
      result = { processed: 'appointment.booked', appointment_id: payload.appointment?.id }
      break

    default:
      result = { skipped: 'unhandled event type', type: payload.type }
  }

  return NextResponse.json({ received: true, ...result })
}

/* Respond 200 to HEAD/GET for webhook verification pings */
export async function GET() {
  return NextResponse.json({ status: 'GHL webhook endpoint active' })
}
