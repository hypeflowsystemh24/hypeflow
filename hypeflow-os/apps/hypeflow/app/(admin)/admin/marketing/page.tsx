'use client'

import { useState } from 'react'
import {
  Mail, MessageSquare, Plus, Play, Pause, Eye, Edit2,
  BarChart2, TrendingUp, Users, Send, Clock, CheckCircle,
  XCircle, MousePointer, AlertCircle, ChevronRight,
  Smartphone, Zap, Target, ArrowUpRight, Copy, Trash2,
  GitMerge, ArrowDown, X, Check,
} from 'lucide-react'

/* ─── Types ─── */
type CampaignType = 'email' | 'sms' | 'whatsapp'
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
type SequenceChannel = 'email' | 'whatsapp' | 'sms'

interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  subject?: string
  audience: number
  sent: number
  opens: number
  clicks: number
  unsubscribes: number
  scheduledAt?: string
  sentAt?: string
  tags: string[]
}

interface SequenceStep {
  channel: SequenceChannel
  delayDays: number
  message: string
  condition?: 'no_reply' | 'no_open' | 'no_click' | 'always'
}

interface CrossChannelSequence {
  id: string
  name: string
  trigger: string
  steps: SequenceStep[]
  enrolled: number
  active: boolean
  conversionRate: number
}

interface Sequence {
  id: string
  name: string
  type: CampaignType
  trigger: string
  steps: number
  enrolled: number
  active: boolean
  conversionRate: number
}

/* ─── Mock Data ─── */
const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Promoção Março — Email', type: 'email', status: 'sent', subject: 'Oferta especial de Março para si 🚀', audience: 1240, sent: 1240, opens: 387, clicks: 89, unsubscribes: 12, sentAt: '2024-03-01', tags: ['promocao'] },
  { id: '2', name: 'Follow-up Webinar', type: 'email', status: 'sent', subject: 'Obrigado por participar! Próximos passos...', audience: 342, sent: 342, opens: 198, clicks: 67, unsubscribes: 3, sentAt: '2024-03-08', tags: ['webinar'] },
  { id: '3', name: 'WhatsApp Leads Quentes', type: 'whatsapp', status: 'sent', audience: 87, sent: 87, opens: 87, clicks: 34, unsubscribes: 0, sentAt: '2024-03-10', tags: ['hot-leads'] },
  { id: '4', name: 'Newsletter Abril', type: 'email', status: 'scheduled', subject: 'Novidades de Abril — HYPE Flow', audience: 1580, sent: 0, opens: 0, clicks: 0, unsubscribes: 0, scheduledAt: '2024-04-01', tags: ['newsletter'] },
  { id: '5', name: 'Reactivação Cold Leads', type: 'sms', status: 'draft', audience: 234, sent: 0, opens: 0, clicks: 0, unsubscribes: 0, tags: ['reactivacao'] },
  { id: '6', name: 'Campanha Lançamento', type: 'email', status: 'paused', subject: 'Estamos a lançar algo especial...', audience: 890, sent: 445, opens: 156, clicks: 42, unsubscribes: 8, tags: ['lancamento'] },
]

const MOCK_SEQUENCES: Sequence[] = [
  { id: '1', name: 'Boas-vindas Novo Lead', type: 'email', trigger: 'lead_created', steps: 5, enrolled: 847, active: true, conversionRate: 18.4 },
  { id: '2', name: 'Nurturing 14 Dias', type: 'email', trigger: 'lead_created', steps: 8, enrolled: 234, active: true, conversionRate: 12.1 },
  { id: '3', name: 'Follow-up Proposta', type: 'whatsapp', trigger: 'stage_changed', steps: 3, enrolled: 56, active: true, conversionRate: 31.2 },
  { id: '4', name: 'Reactivação 30 Dias', type: 'email', trigger: 'time_delay', steps: 4, enrolled: 189, active: false, conversionRate: 8.7 },
]

const MOCK_CROSS_SEQUENCES: CrossChannelSequence[] = [
  {
    id: 'cc1',
    name: 'Activação Novo Lead',
    trigger: 'lead_created',
    enrolled: 312,
    active: true,
    conversionRate: 22.8,
    steps: [
      { channel: 'whatsapp', delayDays: 0, message: 'Olá {nome}! Obrigado pelo interesse. Posso agendar 15min?', condition: 'always' },
      { channel: 'email',    delayDays: 1, message: 'Boas-vindas — {empresa} | Proposta de valor', condition: 'no_reply' },
      { channel: 'whatsapp', delayDays: 3, message: 'Oi {nome}, só para confirmar que recebeu o email. Alguma dúvida?', condition: 'no_reply' },
      { channel: 'sms',      delayDays: 5, message: '{nome}, última tentativa — disponível esta semana?', condition: 'no_reply' },
    ],
  },
  {
    id: 'cc2',
    name: 'Recuperação Pós-Proposta',
    trigger: 'stage_changed',
    enrolled: 89,
    active: true,
    conversionRate: 34.1,
    steps: [
      { channel: 'email',    delayDays: 0, message: 'Proposta em anexo — {empresa}', condition: 'always' },
      { channel: 'whatsapp', delayDays: 2, message: 'Olá {nome}! Recebeu a nossa proposta?', condition: 'no_open' },
      { channel: 'email',    delayDays: 4, message: 'Follow-up: ainda interessado?', condition: 'no_reply' },
      { channel: 'whatsapp', delayDays: 7, message: 'Posso esclarecer alguma dúvida sobre a proposta?', condition: 'no_reply' },
    ],
  },
]

const CHANNEL_CONFIG: Record<SequenceChannel, { label: string; color: string; icon: React.ElementType }> = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', icon: Smartphone },
  email:    { label: 'Email',    color: '#EA4335', icon: Mail },
  sms:      { label: 'SMS',      color: '#F5A623', icon: MessageSquare },
}

const CONDITION_LABELS: Record<NonNullable<SequenceStep['condition']>, string> = {
  always:   'Sempre',
  no_reply: 'Sem resposta',
  no_open:  'Sem abertura',
  no_click: 'Sem clique',
}

/* ─── Cross-Channel Builder Modal ─── */
function CrossChannelBuilderModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (seq: CrossChannelSequence) => void
}) {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('lead_created')
  const [steps, setSteps] = useState<SequenceStep[]>([
    { channel: 'whatsapp', delayDays: 0, message: '', condition: 'always' },
    { channel: 'email',    delayDays: 2, message: '', condition: 'no_reply' },
  ])

  const addStep = () => setSteps(s => [...s, { channel: 'email', delayDays: (s[s.length - 1]?.delayDays ?? 0) + 2, message: '', condition: 'no_reply' }])
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i))
  const updateStep = (i: number, patch: Partial<SequenceStep>) =>
    setSteps(s => s.map((step, idx) => idx === i ? { ...step, ...patch } : step))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(33,160,196,0.15)' }}>
              <GitMerge size={15} style={{ color: 'var(--cyan)' }} />
            </div>
            <div>
              <h2 className="font-bold" style={{ color: 'var(--t1)' }}>Nova Sequência Cross-Canal</h2>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>Cascata multi-canal com condições</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ color: 'var(--t3)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Name + Trigger */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Nome</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Activação Novo Lead..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Gatilho</label>
              <select
                value={trigger}
                onChange={e => setTrigger(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--t1)' }}
              >
                <option value="lead_created">Lead criada</option>
                <option value="stage_changed">Etapa alterada</option>
                <option value="score_threshold">Score atingido</option>
                <option value="time_delay">Tempo decorrido</option>
              </select>
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--t3)' }}>Passos da Cascata</p>
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => {
                const cfg = CHANNEL_CONFIG[step.channel]
                const Icon = cfg.icon
                return (
                  <div key={i}>
                    <div
                      className="flex items-start gap-3 p-4 rounded-2xl"
                      style={{ background: 'var(--s2)', border: `1px solid ${cfg.color}25` }}
                    >
                      {/* Channel selector */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cfg.color}18` }}>
                        <Icon size={14} style={{ color: cfg.color }} />
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Canal</label>
                          <select
                            value={step.channel}
                            onChange={e => updateStep(i, { channel: e.target.value as SequenceChannel })}
                            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--s3)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Aguardar (dias)</label>
                          <input
                            type="number"
                            min={0}
                            value={step.delayDays}
                            onChange={e => updateStep(i, { delayDays: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--s3)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Condição</label>
                          <select
                            value={step.condition ?? 'always'}
                            onChange={e => updateStep(i, { condition: e.target.value as SequenceStep['condition'] })}
                            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--s3)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <option value="always">Sempre</option>
                            <option value="no_reply">Sem resposta</option>
                            <option value="no_open">Sem abertura</option>
                            <option value="no_click">Sem clique</option>
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--t3)' }}>Mensagem</label>
                          <input
                            value={step.message}
                            onChange={e => updateStep(i, { message: e.target.value })}
                            placeholder="Use {nome}, {empresa} como variáveis..."
                            className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                            style={{ background: 'var(--s3)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                          />
                        </div>
                      </div>

                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(i)}
                          className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--danger)' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Connector */}
                    {i < steps.length - 1 && (
                      <div className="flex justify-center py-1.5">
                        <ArrowDown size={14} style={{ color: 'var(--t3)' }} />
                      </div>
                    )}
                  </div>
                )
              })}

              <button
                onClick={addStep}
                className="flex items-center justify-center gap-2 py-3 mt-3 rounded-2xl text-sm transition-all"
                style={{ border: '2px dashed rgba(255,255,255,0.08)', color: 'var(--t3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(33,160,196,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--cyan)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--t3)' }}
              >
                <Plus size={14} /> Adicionar Passo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'var(--t3)' }}
          >
            Cancelar
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => {
              onSave({
                id: `cc${Date.now()}`,
                name: name.trim(),
                trigger,
                steps,
                enrolled: 0,
                active: true,
                conversionRate: 0,
              })
              onClose()
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-40"
            style={{ background: 'var(--cyan)', color: '#0D1117' }}
          >
            Criar Sequência
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Cross-Channel Sequence Card ─── */
function CrossChannelCard({ seq }: { seq: CrossChannelSequence }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card overflow-hidden" style={{ border: expanded ? '1px solid rgba(33,160,196,0.25)' : undefined }}>
      <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(33,160,196,0.12)' }}>
          <GitMerge size={18} style={{ color: 'var(--cyan)' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>{seq.name}</p>
            <div className="w-2 h-2 rounded-full" style={{ background: seq.active ? 'var(--success)' : 'var(--t3)' }} />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>
              CROSS-CANAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs" style={{ color: 'var(--t3)' }}>
              Trigger: {seq.trigger} · {seq.steps.length} passos · {seq.enrolled} inscritos
            </p>
            {/* Channel pills */}
            <div className="flex gap-1">
              {Array.from(new Set(seq.steps.map(s => s.channel))).map(ch => {
                const cfg = CHANNEL_CONFIG[ch]
                const Icon = cfg.icon
                return (
                  <div key={ch} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                    <Icon size={9} style={{ color: cfg.color }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold font-display" style={{ color: 'var(--success)' }}>{seq.conversionRate}%</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>conversão</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
            <Edit2 size={12} className="inline mr-1" />Editar
          </button>
          <ChevronRight size={16} style={{ color: 'var(--t3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
        </div>
      </div>

      {/* Expanded step cascade */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-start gap-3 pt-4 overflow-x-auto pb-2">
            {seq.steps.map((step, i) => {
              const cfg = CHANNEL_CONFIG[step.channel]
              const Icon = cfg.icon
              return (
                <div key={i} className="flex items-center gap-0 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1.5 w-40">
                    {/* Day badge */}
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--s3)', color: 'var(--t3)' }}>
                      {step.delayDays === 0 ? 'Imediato' : `+${step.delayDays}d`}
                    </div>
                    {/* Channel card */}
                    <div
                      className="w-full p-3 rounded-2xl"
                      style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}30` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                          <Icon size={11} style={{ color: cfg.color }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                      {step.message && (
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--t3)' }}>
                          {step.message.slice(0, 60)}{step.message.length > 60 ? '…' : ''}
                        </p>
                      )}
                      {step.condition && step.condition !== 'always' && (
                        <div className="mt-2 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--t3)' }}>
                          <AlertCircle size={8} />
                          {CONDITION_LABELS[step.condition]}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Arrow connector */}
                  {i < seq.steps.length - 1 && (
                    <ChevronRight size={16} className="mx-1 flex-shrink-0" style={{ color: 'var(--t3)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const TYPE_ICONS: Record<CampaignType, React.ElementType> = { email: Mail, sms: MessageSquare, whatsapp: Smartphone }
const TYPE_COLORS: Record<CampaignType, string> = { email: '#EA4335', sms: '#F5A623', whatsapp: '#25D366' }
const TYPE_LABELS: Record<CampaignType, string> = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp' }

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'var(--t3)',
  scheduled: '#21A0C4',
  sending: '#D1FF00',
  sent: 'var(--success)',
  paused: '#F5A623',
}
const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Rascunho', scheduled: 'Agendada', sending: 'Enviando', sent: 'Enviada', paused: 'Pausada',
}

function pct(a: number, b: number) { return b === 0 ? '—' : `${((a / b) * 100).toFixed(1)}%` }

/* ─── Campaign Row ─── */
function CampaignRow({ c }: { c: Campaign }) {
  const Icon = TYPE_ICONS[c.type]
  const typeColor = TYPE_COLORS[c.type]
  return (
    <tr className="transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${typeColor}15` }}>
            <Icon size={14} style={{ color: typeColor }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{c.name}</p>
            {c.subject && <p className="text-xs truncate max-w-[260px]" style={{ color: 'var(--t3)' }}>{c.subject}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: `${typeColor}15`, color: typeColor }}>
          {TYPE_LABELS[c.type]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[c.status]}15`, color: STATUS_COLORS[c.status] }}>
          {STATUS_LABELS[c.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--t2)' }}>{c.audience.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{pct(c.opens, c.sent)}</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>{c.opens} aberturas</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{pct(c.clicks, c.sent)}</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>{c.clicks} cliques</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--t3)' }}>{c.sentAt ?? c.scheduledAt ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {c.status === 'paused' && <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--success)' }}><Play size={13} /></button>}
          {c.status === 'sending' && <button className="p-1.5 rounded-lg tonal-hover" style={{ color: '#F5A623' }}><Pause size={13} /></button>}
          <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}><Eye size={13} /></button>
          <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}><Copy size={13} /></button>
          <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Main Page ─── */
export default function MarketingPage() {
  const [tab, setTab] = useState<'campaigns' | 'sequences' | 'templates'>('campaigns')
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [showCrossBuilder, setShowCrossBuilder] = useState(false)
  const [crossSequences, setCrossSequences] = useState<CrossChannelSequence[]>(MOCK_CROSS_SEQUENCES)

  const filtered = MOCK_CAMPAIGNS.filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    return true
  })

  const stats = {
    sent: MOCK_CAMPAIGNS.filter(c => c.status === 'sent').reduce((s, c) => s + c.sent, 0),
    opens: MOCK_CAMPAIGNS.reduce((s, c) => s + c.opens, 0),
    clicks: MOCK_CAMPAIGNS.reduce((s, c) => s + c.clicks, 0),
    unsubscribes: MOCK_CAMPAIGNS.reduce((s, c) => s + c.unsubscribes, 0),
  }

  return (
    <div className="flex flex-col gap-5">
      {showCrossBuilder && (
        <CrossChannelBuilderModal
          onClose={() => setShowCrossBuilder(false)}
          onSave={seq => setCrossSequences(prev => [seq, ...prev])}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Marketing</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Campanhas de Email, SMS e WhatsApp</p>
        </div>
        <button className="btn-lime flex items-center gap-2 px-5 py-2.5 rounded-xl">
          <Plus size={15} /> Nova Campanha
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Mensagens Enviadas', value: stats.sent.toLocaleString(), icon: Send, color: 'var(--cyan)', delta: '+12%' },
          { label: 'Taxa de Abertura', value: pct(stats.opens, stats.sent), icon: Eye, color: '#D1FF00', delta: '+3.2%' },
          { label: 'Taxa de Clique', value: pct(stats.clicks, stats.sent), icon: MousePointer, color: 'var(--success)', delta: '+1.8%' },
          { label: 'Descadastramentos', value: stats.unsubscribes.toString(), icon: XCircle, color: '#E84545', delta: '-5' },
        ].map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--t2)' }}>{label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--t1)' }}>{value}</p>
              <span className="text-xs font-semibold" style={{ color: color === '#E84545' ? 'var(--success)' : 'var(--success)' }}>{delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-1 py-1 rounded-2xl w-fit" style={{ background: 'var(--s2)' }}>
        {(['campaigns', 'sequences', 'templates'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: tab === t ? 'var(--s3)' : 'transparent', color: tab === t ? 'var(--t1)' : 'var(--t3)' }}
          >
            {t === 'campaigns' ? `Campanhas (${MOCK_CAMPAIGNS.length})` : t === 'sequences' ? `Sequências (${MOCK_SEQUENCES.length})` : 'Templates'}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['all', 'email', 'whatsapp', 'sms'] as const).map(t => {
                const color = t !== 'all' ? TYPE_COLORS[t] : 'var(--t2)'
                const Icon = t !== 'all' ? TYPE_ICONS[t] : null
                return (
                  <button key={t} onClick={() => setTypeFilter(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: typeFilter === t ? 'var(--s3)' : 'transparent', color: typeFilter === t ? (t === 'all' ? 'var(--t1)' : color) : 'var(--t3)' }}>
                    {Icon && <Icon size={11} />}
                    {t === 'all' ? 'Todas' : TYPE_LABELS[t]}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['all', 'draft', 'scheduled', 'sent', 'paused'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: statusFilter === s ? 'var(--s3)' : 'transparent', color: statusFilter === s ? 'var(--t1)' : 'var(--t3)' }}>
                  {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Campanha', 'Canal', 'Estado', 'Audiência', 'Abertura', 'Cliques', 'Data', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => <CampaignRow key={c.id} c={c} />)}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'sequences' && (
        <div className="flex flex-col gap-5">
          {/* Cross-channel section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitMerge size={14} style={{ color: 'var(--cyan)' }} />
                <p className="text-sm font-bold" style={{ color: 'var(--t2)' }}>Sequências Cross-Canal</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>
                  NOVO
                </span>
              </div>
              <button
                onClick={() => setShowCrossBuilder(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}
              >
                <Plus size={12} /> Nova Cross-Canal
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {crossSequences.map(seq => <CrossChannelCard key={seq.id} seq={seq} />)}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

          {/* Standard sequences */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--t2)' }}>Sequências Padrão</p>
            <div className="flex flex-col gap-3">
              {MOCK_SEQUENCES.map(seq => {
                const Icon = TYPE_ICONS[seq.type]
                const typeColor = TYPE_COLORS[seq.type]
                return (
                  <div key={seq.id} className="card p-5 flex items-center gap-5">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${typeColor}15` }}>
                      <Icon size={18} style={{ color: typeColor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold" style={{ color: 'var(--t1)' }}>{seq.name}</p>
                        <div className="w-2 h-2 rounded-full" style={{ background: seq.active ? 'var(--success)' : 'var(--t3)' }} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--t3)' }}>
                        Trigger: {seq.trigger} · {seq.steps} passos · {seq.enrolled} inscritos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold font-display" style={{ color: 'var(--success)' }}>{seq.conversionRate}%</p>
                      <p className="text-xs" style={{ color: 'var(--t3)' }}>conversão</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                        <Edit2 size={12} className="inline mr-1" />Editar
                      </button>
                      <ChevronRight size={16} style={{ color: 'var(--t3)' }} />
                    </div>
                  </div>
                )
              })}
              <button className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm" style={{ border: '2px dashed rgba(255,255,255,0.08)', color: 'var(--t3)' }}>
                <Plus size={15} /> Nova Sequência
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Boas-vindas', type: 'email' as CampaignType, desc: 'Mensagem inicial para novos leads' },
            { name: 'Follow-up 3 dias', type: 'email' as CampaignType, desc: 'Acompanhamento após primeiro contacto' },
            { name: 'Proposta Enviada', type: 'whatsapp' as CampaignType, desc: 'Confirmação de envio de proposta' },
            { name: 'Call Agendada', type: 'whatsapp' as CampaignType, desc: 'Confirmação de agendamento' },
            { name: 'Newsletter Mensal', type: 'email' as CampaignType, desc: 'Template de newsletter com blocos' },
            { name: 'Promoção Flash', type: 'sms' as CampaignType, desc: 'Oferta com urgência e CTA directo' },
          ].map(({ name, type, desc }) => {
            const Icon = TYPE_ICONS[type]
            const color = TYPE_COLORS[type]
            return (
              <div key={name} className="card p-5 flex flex-col gap-3 cursor-pointer tonal-hover">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--t1)' }}>{name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{desc}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${color}15`, color }}>{TYPE_LABELS[type]}</span>
                  <button className="text-xs ml-auto" style={{ color: 'var(--cyan)' }}>Usar →</button>
                </div>
              </div>
            )
          })}
          <div className="card p-5 flex flex-col items-center justify-center gap-2 cursor-pointer tonal-hover" style={{ border: '2px dashed rgba(255,255,255,0.08)' }}>
            <Plus size={24} style={{ color: 'var(--t3)' }} />
            <p className="text-sm" style={{ color: 'var(--t3)' }}>Novo Template</p>
          </div>
        </div>
      )}
    </div>
  )
}
