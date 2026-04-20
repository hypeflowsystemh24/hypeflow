import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* ─── POST /api/settings/save
   Upserts an integration config key to agency_settings.
   Body: { key: string, value: object }
─── */
export async function POST(req: NextRequest) {
  const { key, value } = await req.json()

  if (!key || value === undefined) {
    return NextResponse.json({ ok: false, error: 'key e value são obrigatórios' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || url.includes('placeholder') || !serviceKey) {
    /* No DB configured — silently succeed so the wizard still completes */
    return NextResponse.json({ ok: true, persisted: false })
  }

  try {
    const sb = createClient(url, serviceKey)

    /* agency_id: use env override or fall back to 'default' for single-tenant setups */
    const agencyId = process.env.DEFAULT_AGENCY_ID ?? 'default'

    await sb
      .from('agency_settings')
      .upsert(
        { agency_id: agencyId, key, value },
        { onConflict: 'agency_id,key' }
      )

    return NextResponse.json({ ok: true, persisted: true })
  } catch (err) {
    console.error('[settings/save] error:', err)
    return NextResponse.json({ ok: true, persisted: false })
  }
}
