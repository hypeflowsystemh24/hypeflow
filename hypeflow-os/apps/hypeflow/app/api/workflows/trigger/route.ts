import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executeWorkflow, type TriggerPayload } from '@/lib/workflow-engine'

/* ─── POST /api/workflows/trigger
   Fires all active workflows that match the given trigger_type for an agency.
   Body: { trigger_type, agency_id, lead_id?, lead?, extra? }
─── */
export async function POST(req: NextRequest) {
  const body = await req.json() as TriggerPayload

  const { trigger_type, agency_id } = body
  if (!trigger_type || !agency_id) {
    return NextResponse.json({ error: 'trigger_type e agency_id são obrigatórios' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || url.includes('placeholder') || !key) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no_db' })
  }

  const sb = createClient(url, key)

  /* Find active workflows with a trigger node matching trigger_type */
  const { data: workflows } = await sb
    .from('workflows')
    .select('id, nodes, edges')
    .eq('agency_id', agency_id)
    .eq('status', 'active')

  if (!workflows?.length) {
    return NextResponse.json({ ok: true, fired: 0 })
  }

  const matching = workflows.filter(wf => {
    const nodes = wf.nodes as Array<{ type: string; data: { config: { trigger_type?: string } } }>
    return nodes.some(n => n.type === 'trigger' && n.data?.config?.trigger_type === trigger_type)
  })

  if (!matching.length) {
    return NextResponse.json({ ok: true, fired: 0 })
  }

  /* Determine base URL for internal API calls */
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (req.headers.get('x-forwarded-host')
        ? `https://${req.headers.get('x-forwarded-host')}`
        : 'https://hypeflow-os.vercel.app')

  /* Execute all matching workflows in parallel */
  const results = await Promise.allSettled(
    matching.map(wf => executeWorkflow(wf as Parameters<typeof executeWorkflow>[0], body, baseUrl))
  )

  const summary = results.map((r, i) => ({
    workflow_id: matching[i]!.id,
    ok:    r.status === 'fulfilled' ? r.value.ok  : false,
    runId: r.status === 'fulfilled' ? r.value.runId : null,
    error: r.status === 'rejected'  ? String(r.reason) : undefined,
  }))

  return NextResponse.json({ ok: true, fired: matching.length, results: summary })
}
