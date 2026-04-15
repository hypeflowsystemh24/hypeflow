'use client'

import { useState } from 'react'
import {
  Zap, Plus, Play, Pause, Settings, X,
  Check, AlertCircle, Activity, ArrowRight,
  Webhook, MessageSquare, Phone, UserCheck, Tag, Bell, Mail,
  Monitor, CalendarClock, RefreshCw, GitBranch,
} from 'lucide-react'
import { VisualEditor } from './components/VisualEditor'

/* ─────────────────────── types ─────────────────────── */

type TriggerType  = 'lead_created' | 'stage_changed' | 'score_threshold' | 'time_delay' | 'webhook' | 'before_call' | 'after_call' | 'pipeline_updated'
type ConditionOp  = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'not_empty'
type ActionType   = 'send_whatsapp' | 'send_email' | 'platform_notification' | 'move_stage' | 'assign_agent' | 'add_tag' | 'notify_agent' | 'trigger_n8n' | 'trigger_make' | 'trigger_manychat'
type AutoStatus   = 'active' | 'paused' | 'draft'

interface Condition {
  id: string; field: string; op: ConditionOp; value: string
}
interface Action {
  id: string; type: ActionType; params: Record<string, string>
}
interface Automation {
  id: string
  name: string
  trigger: TriggerType
  conditions: Condition[]
  actions: Action[]
  status: AutoStatus
  runs_total: number
  runs_today: number
  last_run: string | null
  created_at: string
}

/* ─────────────────────── mock data ─────────────────────── */

const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: 'a1', name: 'Boas-vindas WhatsApp', trigger: 'lead_created',
    conditions: [{ id: 'c1', field: 'source', op: 'equals', value: 'facebook' }],
    actions: [
      { id: 'ac1', type: 'send_whatsapp', params: { template: 'welcome_pt' } },
      { id: 'ac2', type: 'add_tag', params: { tag: 'fb-lead' } },
    ],
    status: 'active', runs_total: 342, runs_today: 14, last_run: new Date(Date.now() - 1800000).toISOString(), created_at: '2024-01-10',
  },
  {
    id: 'a2', name: 'Alerta score alto', trigger: 'score_threshold',
    conditions: [{ id: 'c2', field: 'score', op: 'greater_than', value: '80' }],
    actions: [
      { id: 'ac3', type: 'notify_agent', params: { message: 'Lead quente disponível!' } },
      { id: 'ac4', type: 'move_stage', params: { stage: 'qualified' } },
    ],
    status: 'active', runs_total: 87, runs_today: 3, last_run: new Date(Date.now() - 7200000).toISOString(), created_at: '2024-01-15',
  },
  {
    id: 'a3', name: 'Sincronização N8N', trigger: 'stage_changed',
    conditions: [{ id: 'c3', field: 'stage', op: 'equals', value: 'proposal' }],
    actions: [{ id: 'ac5', type: 'trigger_n8n', params: { workflow_id: 'wf-001' } }],
    status: 'active', runs_total: 56, runs_today: 2, last_run: new Date(Date.now() - 3600000).toISOString(), created_at: '2024-02-01',
  },
  {
    id: 'a4', name: 'Follow-up 3 dias', trigger: 'time_delay',
    conditions: [],
    actions: [
      { id: 'ac6', type: 'trigger_manychat', params: { flow_id: 'flow-followup' } },
    ],
    status: 'paused', runs_total: 201, runs_today: 0, last_run: new Date(Date.now() - 86400000 * 2).toISOString(), created_at: '2024-02-10',
  },
  {
    id: 'a5', name: 'Lead perdida — reativação', trigger: 'stage_changed',
    conditions: [{ id: 'c4', field: 'stage', op: 'equals', value: 'lost' }],
    actions: [
      { id: 'ac7', type: 'add_tag', params: { tag: 'reativação' } },
      { id: 'ac8', type: 'trigger_make', params: { scenario_id: 'sc-reactivation' } },
    ],
    status: 'draft', runs_total: 0, runs_today: 0, last_run: null, created_at: '2024-03-01',
  },
  {
    id: 'a6', name: 'Lembrete de Call — 24h antes', trigger: 'before_call',
    conditions: [{ id: 'c5', field: 'hours_before', op: 'equals', value: '24' }],
    actions: [
      { id: 'ac9',  type: 'send_whatsapp',        params: { template: 'reminder_call_24h' } },
      { id: 'ac10', type: 'send_email',            params: { template: 'call_reminder', subject: 'Lembrete: Call amanhã' } },
      { id: 'ac11', type: 'platform_notification', params: { message: 'Call agendada para amanhã' } },
    ],
    status: 'active', runs_total: 128, runs_today: 5, last_run: new Date(Date.now() - 3600000).toISOString(), created_at: '2024-03-05',
  },
  {
    id: 'a7', name: 'Lembrete de Call — 1h antes', trigger: 'before_call',
    conditions: [{ id: 'c6', field: 'hours_before', op: 'equals', value: '1' }],
    actions: [
      { id: 'ac12', type: 'send_whatsapp',        params: { template: 'reminder_call_1h' } },
      { id: 'ac13', type: 'platform_notification', params: { message: '⏰ Call em 1 hora!' } },
    ],
    status: 'active', runs_total: 94, runs_today: 3, last_run: new Date(Date.now() - 1800000).toISOString(), created_at: '2024-03-05',
  },
  {
    id: 'a8', name: 'Follow-up pós call', trigger: 'after_call',
    conditions: [{ id: 'c7', field: 'outcome', op: 'equals', value: 'completed' }],
    actions: [
      { id: 'ac14', type: 'send_email',    params: { template: 'post_call_followup', subject: 'Obrigado pela nossa conversa!' } },
      { id: 'ac15', type: 'send_whatsapp', params: { template: 'post_call_wa' } },
      { id: 'ac16', type: 'add_tag',       params: { tag: 'call-realizada' } },
    ],
    status: 'active', runs_total: 67, runs_today: 2, last_run: new Date(Date.now() - 5400000).toISOString(), created_at: '2024-03-10',
  },
  {
    id: 'a9', name: 'Sync pipeline → notificação', trigger: 'pipeline_updated',
    conditions: [],
    actions: [
      { id: 'ac17', type: 'platform_notification', params: { message: 'Pipeline actualizado em tempo real' } },
      { id: 'ac18', type: 'trigger_n8n',           params: { workflow_id: 'wf-pipeline-sync' } },
    ],
    status: 'active', runs_total: 312, runs_today: 21, last_run: new Date(Date.now() - 600000).toISOString(), created_at: '2024-03-15',
  },
]

const MOCK_LOGS = [
  { id: 'l1', auto_name: 'Boas-vindas WhatsApp', lead: 'Sofia Lopes', status: 'success', time: '10 min atrás' },
  { id: 'l2', auto_name: 'Alerta score alto',    lead: 'Carlos Mendes', status: 'success', time: '1h atrás' },
  { id: 'l3', auto_name: 'Sincronização N8N',    lead: 'João Silva', status: 'error', time: '2h atrás' },
  { id: 'l4', auto_name: 'Boas-vindas WhatsApp', lead: 'Ana Ferreira', status: 'success', time: '3h atrás' },
  { id: 'l5', auto_name: 'Alerta score alto',    lead: 'Miguel Costa', status: 'success', time: '4h atrás' },
  { id: 'l6', auto_name: 'Boas-vindas WhatsApp', lead: 'Rita Oliveira', status: 'success', time: '5h atrás' },
]

/* ─────────────────────── config maps ─────────────────────── */

const TRIGGER_MAP: Record<TriggerType, { label: string; icon: string; color: string }> = {
  lead_created:     { label: 'Lead criada',          icon: '👤', color: '#21A0C4' },
  stage_changed:    { label: 'Etapa alterada',       icon: '📋', color: '#F5A623' },
  score_threshold:  { label: 'Score atingido',       icon: '⭐', color: '#E8A838' },
  time_delay:       { label: 'Atraso de tempo',      icon: '⏰', color: '#7FA8C4' },
  webhook:          { label: 'Webhook externo',      icon: '🔗', color: '#A855F7' },
  before_call:      { label: 'Antes de call',        icon: '📞', color: '#1EC87A' },
  after_call:       { label: 'Após call',            icon: '✅', color: '#21A0C4' },
  pipeline_updated: { label: 'Pipeline actualizado', icon: '🔄', color: '#D1FF00' },
}

const ACTION_MAP: Record<ActionType, { label: string; icon: typeof Zap; color: string }> = {
  send_whatsapp:       { label: 'WhatsApp',             icon: MessageSquare,  color: '#25D366' },
  send_email:          { label: 'Enviar email',         icon: Mail,           color: '#4285F4' },
  platform_notification: { label: 'Notif. plataforma', icon: Monitor,        color: '#D1FF00' },
  move_stage:          { label: 'Mover etapa',          icon: ArrowRight,     color: '#F5A623' },
  assign_agent:        { label: 'Atribuir',             icon: UserCheck,      color: '#21A0C4' },
  add_tag:             { label: 'Tag',                  icon: Tag,            color: '#7FA8C4' },
  notify_agent:        { label: 'Notificar agente',     icon: Bell,           color: '#E8A838' },
  trigger_n8n:         { label: 'N8N',                  icon: Webhook,        color: '#EA4B71' },
  trigger_make:        { label: 'Make',                 icon: Webhook,        color: '#6259FF' },
  trigger_manychat:    { label: 'ManyChat',             icon: MessageSquare,  color: '#00B2FF' },
}

const STATUS_MAP: Record<AutoStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Activa',   color: '#1EC87A', bg: 'bg-[#1EC87A20]' },
  paused: { label: 'Pausada',  color: '#F5A623', bg: 'bg-[#F5A62320]' },
  draft:  { label: 'Rascunho', color: '#3D6080', bg: 'bg-[#3D608020]' },
}

/* ─────────────────────── builder modal ─────────────────────── */

const TRIGGER_OPTIONS: TriggerType[] = ['lead_created', 'stage_changed', 'score_threshold', 'time_delay', 'webhook', 'before_call', 'after_call', 'pipeline_updated']
const ACTION_OPTIONS: ActionType[]   = ['send_whatsapp', 'send_email', 'platform_notification', 'move_stage', 'assign_agent', 'add_tag', 'notify_agent', 'trigger_n8n', 'trigger_make', 'trigger_manychat']

function BuilderModal({ onClose, onSave }: { onClose: () => void; onSave?: (automation: Automation) => void }) {
  const [name, setName]             = useState('')
  const [trigger, setTrigger]       = useState<TriggerType>('lead_created')
  const [scoreMin, setScoreMin]     = useState(70)
  const [scoreMax, setScoreMax]     = useState(100)
  const [stageTarget, setStageTarget] = useState('')
  const [delayHours, setDelayHours] = useState(24)
  const [actions, setActions]       = useState<ActionType[]>(['send_whatsapp'])
  const [conditions, setConditions] = useState<Condition[]>([])

  const addCondition = () => setConditions(cs => [...cs, { id: `cond-${Date.now()}`, field: 'source', op: 'equals', value: '' }])
  const removeCondition = (id: string) => setConditions(cs => cs.filter(c => c.id !== id))
  const updateCondition = (id: string, patch: Partial<Condition>) =>
    setConditions(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))

  const CONDITION_FIELDS = [
    { value: 'source',      label: 'Fonte' },
    { value: 'score',       label: 'Score' },
    { value: 'temperature', label: 'Temperatura' },
    { value: 'stage',       label: 'Etapa' },
    { value: 'tags',        label: 'Tags' },
    { value: 'email',       label: 'Email' },
    { value: 'company',     label: 'Empresa' },
  ]
  const CONDITION_OPS: { value: ConditionOp; label: string }[] = [
    { value: 'equals',       label: 'é igual a' },
    { value: 'contains',     label: 'contém' },
    { value: 'greater_than', label: 'maior que' },
    { value: 'less_than',    label: 'menor que' },
    { value: 'is_empty',     label: 'está vazio' },
    { value: 'not_empty',    label: 'não está vazio' },
  ]

  /* Plain-English rule summary */
  const triggerLabel = TRIGGER_MAP[trigger]?.label ?? trigger
  const condSummary = conditions.length === 0
    ? 'sem condições adicionais'
    : conditions.map(c => {
        const fl = CONDITION_FIELDS.find(f => f.value === c.field)?.label ?? c.field
        const op = CONDITION_OPS.find(o => o.value === c.op)?.label ?? c.op
        const noValue = c.op === 'is_empty' || c.op === 'not_empty'
        return `${fl} ${op}${noValue ? '' : ` "${c.value}"`}`
      }).join(' E ')
  const actSummary = actions.map(a => ACTION_MAP[a]?.label ?? a).join(', ')

  const addAction = () => setActions(a => [...a, 'add_tag'])
  const removeAction = (i: number) => setActions(a => a.filter((_, idx) => idx !== i))
  const changeAction = (i: number, val: ActionType) =>
    setActions(a => a.map((x, idx) => idx === i ? val : x))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--s1)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="section-title">Nova Automação</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#3D6080] hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="label-system block mb-1.5">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Boas-vindas Instagram..."
              className="w-full bg-[var(--s2)] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4]"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="label-system block mb-2">Gatilho (QUANDO)</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_OPTIONS.map(t => {
                const cfg = TRIGGER_MAP[t]
                return (
                  <button
                    key={t}
                    onClick={() => setTrigger(t)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      trigger === t ? 'border-[#21A0C4] bg-[#21A0C415]' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-xs font-700 text-white">{cfg.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Trigger config — score_threshold */}
          {trigger === 'score_threshold' && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#E8A838' }}>
                ⭐ Configurar Score
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Score mínimo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={0} max={100} value={scoreMin}
                      onChange={e => setScoreMin(Number(e.target.value))}
                      className="flex-1" style={{ accentColor: '#E8A838' }}
                    />
                    <span className="text-sm font-bold w-8 text-right" style={{ color: '#E8A838' }}>{scoreMin}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Score máximo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={0} max={100} value={scoreMax}
                      onChange={e => setScoreMax(Number(e.target.value))}
                      className="flex-1" style={{ accentColor: '#E8A838' }}
                    />
                    <span className="text-sm font-bold w-8 text-right" style={{ color: '#E8A838' }}>{scoreMax}</span>
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    marginLeft: `${scoreMin}%`,
                    width: `${Math.max(0, scoreMax - scoreMin)}%`,
                    background: 'linear-gradient(90deg, #E8A838, #E84545)',
                  }}
                />
              </div>
              <p className="text-[10px] mt-2" style={{ color: 'var(--t3)' }}>
                Dispara quando o score estiver entre <span style={{ color: '#E8A838' }}>{scoreMin}–{scoreMax}</span>
              </p>
            </div>
          )}

          {/* Trigger config — stage_changed */}
          {trigger === 'stage_changed' && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#F5A623' }}>
                📋 Etapa destino
              </p>
              <select
                value={stageTarget}
                onChange={e => setStageTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}
              >
                <option value="">Qualquer etapa</option>
                <option value="Novo Lead">Novo Lead</option>
                <option value="Qualificando">Qualificando</option>
                <option value="Call Agendada">Call Agendada</option>
                <option value="Proposta Enviada">Proposta Enviada</option>
                <option value="lost">Perdida</option>
                <option value="won">Ganha</option>
              </select>
            </div>
          )}

          {/* Trigger config — time_delay */}
          {trigger === 'time_delay' && (
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(127,168,196,0.08)', border: '1px solid rgba(127,168,196,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7FA8C4' }}>
                ⏰ Configurar atraso
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={1} value={delayHours}
                  onChange={e => setDelayHours(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl text-sm outline-none text-center"
                  style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}
                />
                <select
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}
                >
                  <option>horas após criação</option>
                  <option>horas após último contacto</option>
                  <option>dias sem resposta</option>
                  <option>dias na mesma etapa</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-system">Condições (SE)</label>
              <button onClick={addCondition} className="text-[10px] font-700 text-[#21A0C4] hover:text-[#4FC8EA] transition-colors">
                + Adicionar condição
              </button>
            </div>
            {conditions.length === 0 ? (
              <div className="rounded-xl px-3 py-2.5 text-xs" style={{ background: 'var(--s2)', color: 'var(--t3)', border: '1px dashed rgba(255,255,255,0.07)' }}>
                Nenhuma condição — aplica-se a todos os leads
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {conditions.map((cond, idx) => (
                  <div key={cond.id} className="flex items-center gap-2">
                    {idx > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>E</span>
                    )}
                    <select value={cond.field} onChange={e => updateCondition(cond.id, { field: e.target.value })}
                      className="flex-1 rounded-xl px-2 py-2 text-xs outline-none"
                      style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}>
                      {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <select value={cond.op} onChange={e => updateCondition(cond.id, { op: e.target.value as ConditionOp })}
                      className="flex-1 rounded-xl px-2 py-2 text-xs outline-none"
                      style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}>
                      {CONDITION_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {cond.op !== 'is_empty' && cond.op !== 'not_empty' && (
                      <input value={cond.value} onChange={e => updateCondition(cond.id, { value: e.target.value })}
                        placeholder="valor"
                        className="flex-1 rounded-xl px-2 py-2 text-xs outline-none"
                        style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }} />
                    )}
                    <button onClick={() => removeCondition(cond.id)} className="p-1.5 rounded-lg text-[#3D6080] hover:text-[#E84545] transition-colors flex-shrink-0">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-system">Acções (FAZER)</label>
              <button onClick={addAction} className="text-[10px] font-700 text-[#21A0C4] hover:text-[#4FC8EA] transition-colors">
                + Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {actions.map((action, i) => {
                const cfg = ACTION_MAP[action]
                const Icon = cfg.icon
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[var(--s2)] flex items-center justify-center flex-shrink-0">
                      <Icon size={12} style={{ color: cfg.color }} />
                    </div>
                    <select
                      value={action}
                      onChange={e => changeAction(i, e.target.value as ActionType)}
                      className="flex-1 bg-[var(--s2)] border border-white/5 rounded-xl px-3 py-2 text-sm text-[#7FA8C4] focus:outline-none focus:border-[#21A0C4]"
                    >
                      {ACTION_OPTIONS.map(a => (
                        <option key={a} value={a}>{ACTION_MAP[a].label}</option>
                      ))}
                    </select>
                    {actions.length > 1 && (
                      <button onClick={() => removeAction(i)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#3D6080] hover:text-[#E84545] transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Plain-English rule summary */}
        <div className="mx-5 mb-4 rounded-xl p-3" style={{ background: 'rgba(33,160,196,0.06)', border: '1px solid rgba(33,160,196,0.15)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--cyan)' }}>Resumo da Regra</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--t2)' }}>
            <span style={{ color: 'var(--t1)', fontWeight: 700 }}>Quando</span> {triggerLabel.toLowerCase()}
            {conditions.length > 0 && <> <span style={{ color: 'var(--t1)', fontWeight: 700 }}>e</span> {condSummary}</>}
            {' '}<span style={{ color: 'var(--t1)', fontWeight: 700 }}>→ fazer:</span> {actSummary}
          </p>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/5 text-sm text-[#7FA8C4] hover:border-white/10 transition-colors">
            Cancelar
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => {
              const newAuto: Automation = {
                id:          `a${Date.now()}`,
                name:        name.trim(),
                trigger,
                conditions,
                actions:     actions.map((type, i) => ({ id: `ac${Date.now()}${i}`, type, params: {} })),
                status:      'active',
                runs_total:  0,
                runs_today:  0,
                last_run:    null,
                created_at:  new Date().toISOString().slice(0, 10),
              }
              onSave?.(newAuto)
              onClose()
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#21A0C4] text-sm font-700 text-[#050D14] hover:bg-[#4FC8EA] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Criar Automação
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── automation card ─────────────────────── */

function AutoCard({ auto, selected, onSelect }: {
  auto: Automation; selected: boolean; onSelect: () => void
}) {
  const st   = STATUS_MAP[auto.status]
  const trig = TRIGGER_MAP[auto.trigger]

  return (
    <div
      onClick={onSelect}
      className={`bg-[var(--s1)] border rounded-2xl p-4 cursor-pointer transition-all hover:border-white/10 ${
        selected ? 'border-[#21A0C4]' : 'border-white/5'
      }`}
    >
      {/* top */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--s2)] flex items-center justify-center text-base">
            {trig.icon}
          </div>
          <div>
            <p className="text-sm font-800 text-white leading-tight">{auto.name}</p>
            <p className="text-[10px] text-[#3D6080] mt-0.5">{trig.label}</p>
          </div>
        </div>
        <span className={`text-[10px] font-700 px-2 py-0.5 rounded-lg ${st.bg}`} style={{ color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* actions preview */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {auto.actions.map(action => {
          const a = ACTION_MAP[action.type]
          const Icon = a.icon
          return (
            <div key={action.id} className="flex items-center gap-1 bg-[var(--s2)] rounded-lg px-2 py-1">
              <Icon size={10} style={{ color: a.color }} />
              <span className="text-[10px] font-700 text-[#7FA8C4]">{a.label}</span>
            </div>
          )
        })}
      </div>

      {/* stats */}
      <div className="flex items-center gap-4 text-[10px] text-[#3D6080]">
        <span><span className="text-white font-700">{auto.runs_total}</span> total</span>
        <span><span className="text-[#1EC87A] font-700">{auto.runs_today}</span> hoje</span>
        {auto.last_run && (
          <span>Última: {new Date(auto.last_run).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────── detail panel ─────────────────────── */

function AutoDetailPanel({ auto, onClose, onEdit }: { auto: Automation; onClose: () => void; onEdit: () => void }) {
  const [status, setStatus] = useState(auto.status)

  return (
    <div className="w-80 flex-shrink-0 bg-[var(--s1)] border-l border-white/5 flex flex-col">
      <div className="flex items-start justify-between p-5 border-b border-white/5">
        <div>
          <h3 className="font-manrope font-700 text-base" style={{ color: 'var(--t1)' }}>{auto.name}</h3>
          <p className="text-xs text-[#7FA8C4] mt-0.5">Detalhes da automação</p>
        </div>
        <button onClick={onClose} className="p-1 text-[#3D6080] hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Status toggle */}
        <div>
          <p className="label-system mb-2">Estado</p>
          <div className="flex gap-2">
            {(['active', 'paused'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-700 transition-colors border ${
                  status === s
                    ? s === 'active'
                      ? 'border-[#1EC87A] bg-[#1EC87A20] text-[#1EC87A]'
                      : 'border-[#F5A623] bg-[#F5A62320] text-[#F5A623]'
                    : 'border-white/5 text-[#7FA8C4] hover:border-white/10'
                }`}
              >
                {s === 'active' ? <Play size={11} /> : <Pause size={11} />}
                {s === 'active' ? 'Activa' : 'Pausar'}
              </button>
            ))}
          </div>
        </div>

        {/* Trigger */}
        <div>
          <p className="label-system mb-2">Gatilho</p>
          <div className="flex items-center gap-2.5 bg-[var(--s2)] rounded-xl p-3">
            <span className="text-base">{TRIGGER_MAP[auto.trigger].icon}</span>
            <div>
              <p className="text-xs font-800 text-white">{TRIGGER_MAP[auto.trigger].label}</p>
            </div>
          </div>
        </div>

        {/* Conditions */}
        {auto.conditions.length > 0 && (
          <div>
            <p className="label-system mb-2">Condições</p>
            <div className="flex flex-col gap-2">
              {auto.conditions.map(c => (
                <div key={c.id} className="flex items-center gap-2 bg-[var(--s2)] rounded-xl p-3 text-xs">
                  <span className="text-[#7FA8C4]">{c.field}</span>
                  <span className="text-[#3D6080]">{c.op}</span>
                  <span className="font-700 text-white">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div>
          <p className="label-system mb-2">Acções</p>
          <div className="flex flex-col gap-2">
            {auto.actions.map((action, i) => {
              const a = ACTION_MAP[action.type]
              const Icon = a.icon
              return (
                <div key={action.id} className="flex items-center gap-3 bg-[var(--s2)] rounded-xl p-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}22` }}>
                    <Icon size={12} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-700 text-white">{a.label}</p>
                    {Object.entries(action.params).map(([k, v]) => (
                      <p key={k} className="text-[10px] text-[#3D6080]">{k}: {v}</p>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#3D6080] font-700">#{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="label-system mb-2">Estatísticas</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total de runs', value: auto.runs_total },
              { label: 'Hoje', value: auto.runs_today },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[var(--s2)] rounded-xl p-3 text-center">
                <p className="metric-lg" style={{ color: 'var(--cyan)' }}>{value}</p>
                <p className="text-[10px] text-[#3D6080] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent logs */}
        <div>
          <p className="label-system mb-2">Logs Recentes</p>
          <div className="flex flex-col gap-2">
            {MOCK_LOGS.filter(l => l.auto_name === auto.name).slice(0, 3).map(log => (
              <div key={log.id} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-[#1EC87A]' : 'bg-[#E84545]'}`} />
                <p className="text-xs text-[#7FA8C4] flex-1 truncate">{log.lead}</p>
                <p className="text-[10px] text-[#3D6080]">{log.time}</p>
              </div>
            ))}
            {MOCK_LOGS.filter(l => l.auto_name === auto.name).length === 0 && (
              <p className="text-xs text-[#3D6080]">Sem logs recentes</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/5 text-xs font-700 text-[#7FA8C4] hover:border-[#21A0C4] hover:text-white transition-colors"
        >
          <Settings size={13} /> Editar Automação
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────── templates gallery ─────────────────────── */

interface AutoTemplate {
  id: string
  name: string
  description: string
  category: 'reactivation' | 'onboarding' | 'nurture' | 'closing'
  steps: Array<{ icon: string; label: string; detail: string }>
  highlight?: boolean
}

const CATEGORY_CFG: Record<AutoTemplate['category'], { label: string; color: string }> = {
  reactivation: { label: 'Reactivação',  color: '#E84545' },
  onboarding:   { label: 'Onboarding',   color: '#1EC87A' },
  nurture:      { label: 'Nutrição',     color: '#21A0C4' },
  closing:      { label: 'Fecho',        color: '#D1FF00' },
}

const AUTO_TEMPLATES: AutoTemplate[] = [
  {
    id: 'tpl-cold-reactivation',
    name: 'Reactivação de Leads Frias',
    description: 'Sequência automática para leads sem contacto há +7 dias com score em queda — aumenta re-engagement em 34%.',
    category: 'reactivation',
    highlight: true,
    steps: [
      { icon: '❄️', label: 'Gatilho: 7 dias sem contacto', detail: 'Score caiu ≥15pts na última semana' },
      { icon: '💬', label: 'WA: mensagem de check-in', detail: 'Template "reactivation_cold_pt" com nome personalizado' },
      { icon: '⏰', label: 'Aguardar 48h', detail: 'Sem resposta → continuar sequência' },
      { icon: '📧', label: 'Email: oferta exclusiva', detail: 'Desconto 20% ou conteúdo de valor gratuito' },
      { icon: '⏰', label: 'Aguardar 72h', detail: 'Ainda sem resposta → escalar' },
      { icon: '📞', label: 'Notificar agente', detail: 'Alerta urgente + tag "cold-escalated"' },
    ],
  },
  {
    id: 'tpl-hot-lead-onboarding',
    name: 'Onboarding Lead HOT',
    description: 'Boas-vindas imediatas para leads com score >80 — acção em <5min após entrada no pipeline.',
    category: 'onboarding',
    steps: [
      { icon: '🔥', label: 'Gatilho: score >80 ao criar', detail: 'Lead nova com score inicial elevado' },
      { icon: '💬', label: 'WA: boas-vindas personalizadas', detail: 'Template "welcome_hot" com fonte de tráfego' },
      { icon: '📋', label: 'Mover para "Qualificada"', detail: 'Skip stage de qualificação automático' },
      { icon: '🔔', label: 'Notif. urgente ao agente', detail: '"Lead HOT disponível — fechar em 24h"' },
    ],
  },
  {
    id: 'tpl-proposal-nurture',
    name: 'Nutrição Pós-Proposta',
    description: 'Sequência de follow-up para leads na etapa de proposta sem resposta — mantém top-of-mind.',
    category: 'nurture',
    steps: [
      { icon: '📋', label: 'Gatilho: etapa = Proposta enviada', detail: '24h na etapa sem resposta' },
      { icon: '📧', label: 'Email: resumo da proposta', detail: 'PDF resumo + benefícios chave' },
      { icon: '⏰', label: 'Aguardar 3 dias', detail: 'Ainda em silêncio' },
      { icon: '💬', label: 'WA: pergunta de objecção', detail: '"Há alguma dúvida que posso esclarecer?"' },
      { icon: '📞', label: 'Agendar call de follow-up', detail: 'Link Calendly automático no WA' },
    ],
  },
  {
    id: 'tpl-post-call-closing',
    name: 'Fecho Pós-Call',
    description: 'Acções imediatas após call com resultado "positivo" — acelera o fecho em 2-3 dias.',
    category: 'closing',
    steps: [
      { icon: '✅', label: 'Gatilho: call concluída (positivo)', detail: 'Outcome = completed + score ≥75' },
      { icon: '📧', label: 'Email: proposta dentro de 1h', detail: 'Template "proposal_post_call"' },
      { icon: '💬', label: 'WA: confirmação de envio', detail: '"Proposta enviada! Reveja e diga-me o que acha."' },
      { icon: '⏰', label: 'Aguardar 24h', detail: 'Sem assinatura → lembrete' },
      { icon: '🏷️', label: 'Tag: close-pipeline', detail: 'Mover para etapa de negociação' },
    ],
  },
]

function TemplateCard({ tpl, onActivate }: { tpl: AutoTemplate; onActivate: (tpl: AutoTemplate) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORY_CFG[tpl.category]

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: 'var(--s2)',
        border: tpl.highlight ? '1px solid rgba(232,69,69,0.3)' : '1px solid rgba(255,255,255,0.04)',
        boxShadow: tpl.highlight ? '0 0 20px rgba(232,69,69,0.08)' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cat.color}18`, color: cat.color }}>
              {cat.label}
            </span>
            {tpl.highlight && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(232,69,69,0.15)', color: '#E84545' }}>
                RECOMENDADO
              </span>
            )}
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{tpl.name}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--t3)' }}>{tpl.description}</p>
        </div>
      </div>

      {/* Steps preview */}
      <div className={`flex flex-col gap-1.5 overflow-hidden transition-all ${expanded ? '' : 'max-h-28'}`} style={{ position: 'relative' }}>
        {tpl.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-sm flex-shrink-0 w-5 text-center">{step.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--t2)' }}>{step.label}</p>
              {expanded && <p className="text-[9px] mt-0.5" style={{ color: 'var(--t3)' }}>{step.detail}</p>}
            </div>
            <span className="text-[9px] font-bold flex-shrink-0" style={{ color: 'var(--t3)' }}>#{i + 1}</span>
          </div>
        ))}
        {!expanded && tpl.steps.length > 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: 'linear-gradient(transparent, var(--s2))' }} />
        )}
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="text-[10px] font-bold self-start"
        style={{ color: 'var(--t3)' }}
      >
        {expanded ? '▲ Menos' : `▼ Ver ${tpl.steps.length} passos`}
      </button>

      <button
        onClick={() => onActivate(tpl)}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
        style={{
          background: tpl.highlight ? '#E84545' : 'var(--cyan)',
          color: tpl.highlight ? '#fff' : '#0F1318',
        }}
      >
        <Zap size={12} /> Usar este template
      </button>
    </div>
  )
}

/* ─────────────────────── main page ─────────────────────── */

export default function AutomacoesPage() {
  const [showBuilder, setShowBuilder]       = useState(false)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const [selectedAuto, setSelectedAuto]     = useState<Automation | null>(null)
  const [statusFilter, setStatusFilter]     = useState<AutoStatus | 'all'>('all')
  const [automations, setAutomations]       = useState<Automation[]>(MOCK_AUTOMATIONS)
  const [pageTab, setPageTab]               = useState<'automacoes' | 'templates'>('automacoes')

  const filtered = automations.filter(a =>
    statusFilter === 'all' || a.status === statusFilter
  )

  const handleSaveAutomation = (automation: Automation) => {
    setAutomations(prev => {
      const exists = prev.find(a => a.id === automation.id)
      return exists
        ? prev.map(a => a.id === automation.id ? automation : a)
        : [automation, ...prev]
    })
  }

  const activateTemplate = (tpl: AutoTemplate) => {
    const newAuto: Automation = {
      id:         `a${Date.now()}`,
      name:       tpl.name,
      trigger:    tpl.category === 'reactivation' ? 'time_delay'
                : tpl.category === 'onboarding'   ? 'lead_created'
                : tpl.category === 'nurture'       ? 'stage_changed'
                : 'after_call',
      conditions: [],
      actions:    tpl.steps
        .filter(s => s.icon === '💬' || s.icon === '📧' || s.icon === '🔔' || s.icon === '📞')
        .slice(0, 3)
        .map((s, i) => ({
          id:     `ac${Date.now()}${i}`,
          type:   s.icon === '💬' ? 'send_whatsapp'
                : s.icon === '📧' ? 'send_email'
                : s.icon === '🔔' ? 'notify_agent'
                : 'platform_notification' as ActionType,
          params: { template: tpl.id },
        })),
      status:     'active',
      runs_total: 0,
      runs_today: 0,
      last_run:   null,
      created_at: new Date().toISOString().slice(0, 10),
    }
    setAutomations(prev => [newAuto, ...prev])
    setPageTab('automacoes')
  }

  const totalRuns  = automations.reduce((s, a) => s + a.runs_today, 0)
  const active     = automations.filter(a => a.status === 'active').length
  const errorCount = MOCK_LOGS.filter(l => l.status === 'error').length

  if (showVisualEditor) {
    return <VisualEditor onClose={() => setShowVisualEditor(false)} />
  }

  return (
    <>
      {showBuilder && <BuilderModal onClose={() => setShowBuilder(false)} onSave={handleSaveAutomation} />}

      <div className="flex h-full gap-0">
        {/* Main */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="display-title" style={{ fontSize: '2.75rem' }}>Automações</h1>
              <p className="text-sm text-[#7FA8C4] mt-0.5">{active} activas · {totalRuns} runs hoje</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVisualEditor(true)}
                className="flex items-center gap-2 text-xs font-700 text-[#7FA8C4] border border-white/10 px-4 py-2 rounded-xl hover:border-[#21A0C4] hover:text-white transition-colors"
              >
                <GitBranch size={13} /> Editor Visual
              </button>
              <button
                onClick={() => setShowBuilder(true)}
                className="flex items-center gap-2 text-xs font-700 text-[#050D14] bg-[#21A0C4] px-4 py-2 rounded-xl hover:bg-[#4FC8EA] transition-colors"
              >
                <Plus size={13} /> Nova Automação
              </button>
            </div>
          </div>

          {/* Page tab */}
          <div className="flex gap-0.5 rounded-xl p-1 w-fit" style={{ background: 'var(--s1)' }}>
            {([
              { id: 'automacoes', label: 'Minhas automações' },
              { id: 'templates',  label: `Templates  (${AUTO_TEMPLATES.length})` },
            ] as const).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPageTab(id)}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: pageTab === id ? 'var(--s3)' : 'transparent',
                  color:      pageTab === id ? 'var(--t1)' : 'var(--t3)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Templates gallery */}
          {pageTab === 'templates' && (
            <div className="flex-1 overflow-y-auto flex flex-col gap-5">
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(232,69,69,0.06)', border: '1px solid rgba(232,69,69,0.2)' }}>
                <span className="text-2xl">❄️</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#E84545' }}>Leads frias detectadas — acção recomendada</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>7 leads sem contacto há +7 dias com score em queda. Active o template de reactivação abaixo.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {AUTO_TEMPLATES.map(tpl => (
                  <TemplateCard key={tpl.id} tpl={tpl} onActivate={activateTemplate} />
                ))}
              </div>
            </div>
          )}

          {/* Automações tab content */}
          {pageTab === 'automacoes' && (<>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Activas',     value: String(active),     color: '#1EC87A', icon: Play },
                { label: 'Runs hoje',   value: String(totalRuns),  color: '#21A0C4', icon: Activity },
                { label: 'Total runs',  value: String(automations.reduce((s,a)=>s+a.runs_total,0)), color: '#F5A623', icon: Zap },
                { label: 'Erros hoje',  value: String(errorCount), color: '#E84545', icon: AlertCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="metric-xl">{value}</p>
                    <p className="text-xs text-[#7FA8C4]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex bg-[var(--s2)] border border-white/5 rounded-xl overflow-hidden w-fit">
              {(['all', 'active', 'paused', 'draft'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 text-xs font-700 transition-colors ${
                    statusFilter === s ? 'bg-[#21A0C4] text-[#050D14]' : 'text-[#7FA8C4] hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'Todas' : STATUS_MAP[s].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto flex-1">
              {filtered.map(auto => (
                <AutoCard
                  key={auto.id}
                  auto={auto}
                  selected={selectedAuto?.id === auto.id}
                  onSelect={() => setSelectedAuto(selectedAuto?.id === auto.id ? null : auto)}
                />
              ))}
            </div>

            <div>
              <p className="text-xs font-700 text-[#3D6080] uppercase tracking-widest mb-3">Actividade Recente</p>
              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl overflow-hidden">
                <div className="divide-y divide-white/5">
                  {MOCK_LOGS.map(log => (
                    <div key={log.id} className="flex items-center gap-4 px-4 py-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        log.status === 'success' ? 'bg-[#1EC87A20]' : 'bg-[#E8454520]'
                      }`}>
                        {log.status === 'success'
                          ? <Check size={11} className="text-[#1EC87A]" />
                          : <AlertCircle size={11} className="text-[#E84545]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-700 text-white">{log.auto_name}</p>
                        <p className="text-[10px] text-[#3D6080]">Lead: {log.lead}</p>
                      </div>
                      <p className="text-[10px] text-[#3D6080] flex-shrink-0">{log.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>)}
        </div>

        {/* Detail panel */}
        {selectedAuto && (
          <AutoDetailPanel
            auto={selectedAuto}
            onClose={() => setSelectedAuto(null)}
            onEdit={() => { setSelectedAuto(null); setShowBuilder(true) }}
          />
        )}
      </div>
    </>
  )
}
