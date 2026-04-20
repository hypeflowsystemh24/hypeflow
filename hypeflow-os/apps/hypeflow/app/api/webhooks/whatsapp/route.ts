import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* ─── GET — webhook verification (Meta challenge) ─── */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? 'hypeflow-webhook-verify'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[whatsapp-webhook] Verification OK')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/* ─── POST — receive incoming messages ─── */
export async function POST(req: NextRequest) {
  const body = await req.json()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasDB = url && !url.includes('placeholder') && key

  try {
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value  = change?.value

    if (!value?.messages?.length) {
      /* Could be a status update — acknowledge and ignore */
      return NextResponse.json({ ok: true })
    }

    for (const msg of value.messages) {
      const from    = msg.from              // sender phone number
      const msgId   = msg.id
      const ts      = msg.timestamp
      const text    = msg.text?.body ?? msg.caption ?? ''
      const msgType = msg.type             // text | image | audio | etc.

      console.log(`[whatsapp] Incoming from ${from}: ${text}`)

      /* Persist to DB if available */
      if (hasDB) {
        const sb = createClient(url!, key!)

        /* Try to find matching lead by phone */
        const { data: lead } = await sb
          .from('leads')
          .select('id, name')
          .or(`phone.eq.${from},phone.eq.+${from}`)
          .maybeSingle()

        /* Store message in whatsapp_messages table */
        await sb.from('whatsapp_messages').insert({
          external_id:  msgId,
          direction:    'inbound',
          from_number:  from,
          to_number:    value.metadata?.display_phone_number,
          body:         text,
          message_type: msgType,
          lead_id:      lead?.id ?? null,
          timestamp:    new Date(Number(ts) * 1000).toISOString(),
          raw_payload:  msg,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[whatsapp-webhook] Error:', err)
    /* Always return 200 to Meta or it will retry */
    return NextResponse.json({ ok: true })
  }
}
