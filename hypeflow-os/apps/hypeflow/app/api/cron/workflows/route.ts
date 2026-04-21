import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/* ─── GET /api/cron/workflows
   Called by Vercel Cron every minute.
   1. Marks stuck `running` runs (>10 min) as failed.
   2. Processes pending delayed steps from `workflow_pending_steps` if the table exists.
─── */
export async function GET(req: NextRequest) {
  /* Verify Vercel Cron secret */
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || url.includes('placeholder') || !key) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const sb = createClient(url, key)
  const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString()

  /* 1. Fail stuck runs */
  const { data: stuckRuns } = await sb
    .from('workflow_runs')
    .select('id')
    .eq('status', 'running')
    .lt('started_at', tenMinAgo)

  const stuck = stuckRuns?.length ?? 0
  if (stuck > 0) {
    await sb
      .from('workflow_runs')
      .update({ status: 'failed', error: 'timeout — run exceeded 10 minutes', finished_at: new Date().toISOString() })
      .eq('status', 'running')
      .lt('started_at', tenMinAgo)
  }

  /* 2. Process pending delayed steps — table may not exist yet (graceful) */
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hypeflow-os.vercel.app'
  let resumed = 0

  try {
    const { data: pending } = await sb
      .from('workflow_pending_steps')
      .select('id, workflow_id, run_id, node_id, agency_id, lead_id, execute_at')
      .lte('execute_at', new Date().toISOString())
      .eq('status', 'pending')
      .limit(50)

    if (pending?.length) {
      for (const step of pending) {
        /* Mark as processing */
        await sb.from('workflow_pending_steps').update({ status: 'processing' }).eq('id', step.id)

        /* Re-fire the workflow from this node */
        await fetch(`${baseUrl}/api/workflows/resume`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(step),
        })

        resumed++
      }
    }
  } catch { /* table doesn't exist yet — skip */ }

  return NextResponse.json({ ok: true, stuck_failed: stuck, delayed_resumed: resumed })
}
