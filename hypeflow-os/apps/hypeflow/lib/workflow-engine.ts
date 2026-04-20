import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type {
  WFNode, WFEdge,
  TriggerConfig, WhatsappConfig, EmailConfig, DelayConfig, ConditionConfig,
} from '@/app/(admin)/admin/automacoes/disparos/sequencias/components/types'

/* ─────────────────────────────────────────────
   Workflow Execution Engine — Wave 20
   Executes active workflows in response to triggers.
   ───────────────────────────────────────────── */

export interface TriggerPayload {
  trigger_type: TriggerConfig['trigger_type']
  agency_id:    string
  lead_id?:     string
  lead?:        Record<string, unknown>
  extra?:       Record<string, unknown>
}

interface RunContext {
  sb:        SupabaseClient
  agencyId:  string
  lead:      Record<string, unknown>
  runId:     string
  baseUrl:   string
}

/* ── helpers ── */

function resolveVariables(text: string, lead: Record<string, unknown>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => String(lead[key] ?? ''))
}

function evaluateCondition(cfg: ConditionConfig, lead: Record<string, unknown>): boolean {
  const raw   = lead[cfg.field]
  const val   = String(raw ?? '')
  const check = cfg.value

  switch (cfg.operator) {
    case 'equals':       return val === check
    case 'not_equals':   return val !== check
    case 'greater_than': return Number(val) > Number(check)
    case 'less_than':    return Number(val) < Number(check)
    case 'contains':     return val.includes(check)
    case 'not_contains': return !val.includes(check)
    default:             return false
  }
}

async function log(sb: SupabaseClient, runId: string, nodeId: string, status: 'ok' | 'error' | 'skipped', message: string) {
  await sb.from('workflow_logs').insert({ run_id: runId, node_id: nodeId, status, message, created_at: new Date().toISOString() })
}

/* ── node executors ── */

async function executeWhatsapp(node: WFNode, ctx: RunContext): Promise<void> {
  const cfg = node.data.config as WhatsappConfig
  const phone = String(ctx.lead.phone ?? ctx.lead.telefone ?? '')
  if (!phone) { await log(ctx.sb, ctx.runId, node.id, 'skipped', 'Lead sem número de telefone'); return }

  const message = resolveVariables(cfg.message, ctx.lead)

  const res = await fetch(`${ctx.baseUrl}/api/whatsapp/send`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ agencyId: ctx.agencyId, to: phone, message }),
  })

  const ok = res.ok
  await log(ctx.sb, ctx.runId, node.id, ok ? 'ok' : 'error', ok ? `WhatsApp enviado para ${phone}` : `Erro ao enviar WhatsApp: ${await res.text()}`)
}

async function executeEmail(node: WFNode, ctx: RunContext): Promise<void> {
  const cfg   = node.data.config as EmailConfig
  const email = String(ctx.lead.email ?? '')
  if (!email) { await log(ctx.sb, ctx.runId, node.id, 'skipped', 'Lead sem email'); return }

  const subject = resolveVariables(cfg.subject, ctx.lead)
  const body    = resolveVariables(cfg.body,    ctx.lead)

  const res = await fetch(`${ctx.baseUrl}/api/email/send`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ agencyId: ctx.agencyId, to: email, subject, message: body, from_name: cfg.from_name }),
  })

  const ok = res.ok
  await log(ctx.sb, ctx.runId, node.id, ok ? 'ok' : 'error', ok ? `Email enviado para ${email}` : `Erro ao enviar email: ${await res.text()}`)
}

async function executeDelay(node: WFNode, ctx: RunContext): Promise<void> {
  const cfg = node.data.config as DelayConfig
  /* MVP: log delay but don't actually wait — async scheduling is a future enhancement */
  const ms = cfg.value * (cfg.unit === 'minutes' ? 60_000 : cfg.unit === 'hours' ? 3_600_000 : 86_400_000)
  await log(ctx.sb, ctx.runId, node.id, 'skipped', `Delay de ${cfg.value} ${cfg.unit} (${ms}ms) — skipped no MVP`)
}

/* ── topological traversal ── */

function getNextNodes(currentId: string, edges: WFEdge[], nodes: WFNode[], handle?: string): WFNode[] {
  return edges
    .filter(e => e.source === currentId && (!handle || e.sourceHandle === handle))
    .map(e => nodes.find(n => n.id === e.target))
    .filter(Boolean) as WFNode[]
}

async function traverseNode(node: WFNode, nodes: WFNode[], edges: WFEdge[], ctx: RunContext, visited = new Set<string>()): Promise<void> {
  if (visited.has(node.id)) return
  visited.add(node.id)

  let conditionHandle: string | undefined

  switch (node.type) {
    case 'trigger':
      await log(ctx.sb, ctx.runId, node.id, 'ok', 'Trigger disparado')
      break

    case 'whatsapp':
      await executeWhatsapp(node, ctx)
      break

    case 'email':
      await executeEmail(node, ctx)
      break

    case 'delay':
      await executeDelay(node, ctx)
      break

    case 'condition': {
      const cfg    = node.data.config as ConditionConfig
      const result = evaluateCondition(cfg, ctx.lead)
      conditionHandle = result ? 'right' : 'bottom'
      await log(ctx.sb, ctx.runId, node.id, 'ok', `Condição avaliada: ${result ? 'true' : 'false'}`)
      break
    }

    case 'end':
      await log(ctx.sb, ctx.runId, node.id, 'ok', `Workflow terminado — ${(node.data.config as { reason?: string }).reason ?? 'completed'}`)
      return

    default:
      await log(ctx.sb, ctx.runId, node.id, 'skipped', `Tipo de nó não suportado: ${node.type}`)
  }

  const next = getNextNodes(node.id, edges, nodes, conditionHandle)
  for (const n of next) await traverseNode(n, nodes, edges, ctx, visited)
}

/* ── main export ── */

export async function executeWorkflow(
  workflow: { id: string; nodes: WFNode[]; edges: WFEdge[] },
  payload:  TriggerPayload,
  baseUrl:  string,
): Promise<{ runId: string; ok: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const sb  = createClient(url, key)

  /* Fetch lead data */
  let lead: Record<string, unknown> = payload.lead ?? {}
  if (!Object.keys(lead).length && payload.lead_id) {
    const { data } = await sb.from('leads').select('*').eq('id', payload.lead_id).maybeSingle()
    if (data) lead = data
  }

  /* Create run record */
  const { data: run } = await sb
    .from('workflow_runs')
    .insert({ workflow_id: workflow.id, status: 'running', started_at: new Date().toISOString(), trigger_payload: payload })
    .select('id').single()

  const runId = run?.id ?? crypto.randomUUID()

  const ctx: RunContext = { sb, agencyId: payload.agency_id, lead, runId, baseUrl }

  try {
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger')
    if (!triggerNode) throw new Error('Workflow sem nó trigger')

    await traverseNode(triggerNode, workflow.nodes, workflow.edges, ctx)

    await sb.from('workflow_runs').update({ status: 'completed', finished_at: new Date().toISOString() }).eq('id', runId)
    return { runId, ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await sb.from('workflow_runs').update({ status: 'failed', finished_at: new Date().toISOString(), error: msg }).eq('id', runId)
    return { runId, ok: false, error: msg }
  }
}
