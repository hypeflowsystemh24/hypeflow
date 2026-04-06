import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * ManyChat → HYPE Flow OS webhook
 * Receives subscriber data from ManyChat flows
 * Creates or updates leads in the CRM
 */
export async function POST(req: NextRequest) {
  // Verify the request is from ManyChat via custom field or signature
  const body = await req.json() as {
    type: 'subscriber_created' | 'flow_completed' | 'tag_added'
    subscriber: {
      id: string
      first_name: string
      last_name: string
      email?: string
      phone?: string
      custom_fields?: Array<{ field_key: string; field_value: string }>
    }
    agency_id: string
    client_id: string
    source?: string
    tags?: string[]
    flow_ns?: string
  }

  const supabase = await createServiceClient()

  const { subscriber, agency_id, client_id } = body
  const fullName = [subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ')

  // Extract custom fields
  const customFields = Object.fromEntries(
    (subscriber.custom_fields ?? []).map(f => [f.field_key, f.field_value])
  )

  try {
    // Check if lead already exists (by phone or email)
    const existing = subscriber.email
      ? await supabase
          .from('leads')
          .select('id, tags, score, temperature')
          .eq('client_id', client_id)
          .eq('email', subscriber.email)
          .single()
      : null

    if (existing?.data) {
      // Update existing lead
      const lead = existing.data
      const newTags = [...new Set([...(lead.tags ?? []), ...(body.tags ?? []), 'manychat'])]

      await supabase
        .from('leads')
        .update({
          tags: newTags,
          temperature: 'warm', // ManyChat interaction = warmer lead
          last_contact_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

      // Log interaction
      await supabase.from('lead_interactions').insert({
        lead_id: lead.id,
        agency_id,
        type: 'manychat',
        content: `ManyChat event: ${body.type}${body.flow_ns ? ` (flow: ${body.flow_ns})` : ''}`,
        metadata: { subscriber_id: subscriber.id, flow_ns: body.flow_ns },
      })

      // Trigger automation
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/automation-engine`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger_type: 'lead_created', lead_id: lead.id }),
      }).catch(console.error)

      return NextResponse.json({ success: true, action: 'updated', lead_id: lead.id })
    }

    // Create new lead
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        agency_id,
        client_id,
        full_name: fullName || 'Lead ManyChat',
        email: subscriber.email,
        phone: subscriber.phone ?? customFields['phone'],
        source: 'manychat',
        source_type: 'organic',
        temperature: 'warm',
        status: 'new',
        tags: [...(body.tags ?? []), 'manychat'],
        notes: body.flow_ns ? `Origem: ManyChat flow ${body.flow_ns}` : 'Origem: ManyChat',
      })
      .select('id')
      .single()

    if (error) throw error

    // Trigger automation for new lead
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/automation-engine`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger_type: 'lead_created', lead_id: newLead.id }),
    }).catch(console.error)

    return NextResponse.json({ success: true, action: 'created', lead_id: newLead.id })
  } catch (err) {
    console.error('[manychat-webhook]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
