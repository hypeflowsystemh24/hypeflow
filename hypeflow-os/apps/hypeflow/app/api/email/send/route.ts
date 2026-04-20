import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* ─── helpers ─── */

async function getEmailConfig(agencyId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || url.includes('placeholder')) return null

  const sb = createClient(url, key)
  const { data } = await sb
    .from('agency_settings')
    .select('value')
    .eq('agency_id', agencyId)
    .eq('key', 'email_config')
    .single()

  return data?.value ?? null
}

/* ─── POST /api/email/send ─── */

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { agencyId, to, subject, html, from_name, from_email } = body

  if (!agencyId || !to || !subject || !html) {
    return NextResponse.json({ error: 'Campos obrigatórios: agencyId, to, subject, html' }, { status: 400 })
  }

  /* Load config from DB or fall back to env vars */
  const cfg = await getEmailConfig(agencyId)
  const apiKey   = cfg?.resend_api_key ?? process.env.RESEND_API_KEY
  const fromName = from_name ?? cfg?.from_name ?? 'HYPE Flow'
  const fromAddr = from_email ?? cfg?.from_email ?? process.env.EMAIL_FROM ?? 'noreply@hypeflow.pt'

  if (!apiKey) {
    console.log(`[email] PREVIEW — to: ${to}, subject: ${subject}`)
    return NextResponse.json({ sent: false, preview: true })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${fromName} <${fromAddr}>`,
      to:   Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json({ sent: true, id: data.id })
}
