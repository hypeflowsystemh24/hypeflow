'use client'

import { useState } from 'react'
import {
  Mail, MessageSquare, Plus, Play, Pause, Eye, Edit2,
  BarChart2, TrendingUp, Users, Send, Clock, CheckCircle,
  XCircle, MousePointer, AlertCircle, ChevronRight,
  Smartphone, Zap, Target, ArrowUpRight, Copy, Trash2,
} from 'lucide-react'

/* ─── Types ─── */
type CampaignType = 'email' | 'sms' | 'whatsapp'
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'

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
