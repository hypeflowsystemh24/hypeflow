import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function getWAConfig(agencyId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || url.includes('placeholder')) return null

  const sb = createClient(url, key)
  const { data } = await sb
    .from('agency_settings')
    .select('value')
    .eq('agency_id', agencyId)
    .eq('key', 'whatsapp_config')
    .single()

  return data?.value ?? null
}

/* ─── POST /api/whatsapp/send ─── */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { agencyId, to, message, template_name, template_language, variables } = body

  if (!agencyId || !to) {
    return NextResponse.json({ error: 'Campos obrigatórios: agencyId, to' }, { status: 400 })
  }

  const cfg         = await getWAConfig(agencyId)
  const accessToken = cfg?.access_token    ?? process.env.WA_TOKEN
  const phoneId     = cfg?.phone_number_id ?? process.env.WA_PHONE_NUMBER_ID

  if (!accessToken || !phoneId) {
    return NextResponse.json({ error: 'WhatsApp não configurado. Configure na página de Integrações.' }, { status: 503 })
  }

  /* Build payload — template or free-form text */
  const payload = template_name
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name:     template_name,
          language: { code: template_language ?? 'pt_PT' },
          components: variables?.length ? [{
            type:       'body',
            parameters: variables.map((v: string) => ({ type: 'text', text: v })),
          }] : [],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message ?? '' },
      }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err?.error?.message ?? 'Erro ao enviar mensagem' }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ sent: true, message_id: data.messages?.[0]?.id })
}
