'use client'

import { useState } from 'react'
import { Video, Clock, CheckCircle2, XCircle, Phone, Calendar, X } from 'lucide-react'

/* ── types & mock ── */

type CallStatus = 'scheduled' | 'completed' | 'no_show'

interface PortalCall {
  id: string; lead_name: string; agent: string; date: string
  type: string; status: CallStatus; outcome: string | null
  duration_min: number | null; meet_link: string | null; notes: string | null
}

const TODAY = new Date()
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (iso: string) => `${pad(new Date(iso).getHours())}:${pad(new Date(iso).getMinutes())}`

const MOCK_CALLS: PortalCall[] = [
  {
    id: 'c0', lead_name: 'João Silva', agent: 'Dex Silva',
    date: (() => { const d = addDays(TODAY, 0); d.setHours(14,0,0,0); return d.toISOString() })(),
    type: 'Proposta', status: 'scheduled', outcome: null, duration_min: null,
    meet_link: 'https://meet.google.com/abc-def-ghi', notes: null,
  },
  {
    id: 'c1', lead_name: 'Ana Ferreira', agent: 'Quinn Costa',
    date: (() => { const d = addDays(TODAY, 2); d.setHours(10,0,0,0); return d.toISOString() })(),
    type: 'Descoberta', status: 'scheduled', outcome: null, duration_min: null,
    meet_link: 'https://meet.google.com/xyz-abc-123', notes: null,
  },
  {
    id: 'c2', lead_name: 'Carlos Mendes', agent: 'Dex Silva',
    date: (() => { const d = addDays(TODAY, -1); d.setHours(15,0,0,0); return d.toISOString() })(),
    type: 'Follow-up', status: 'completed', outcome: 'Avançou para proposta',
    duration_min: 35, meet_link: null, notes: 'Muito interesse no pacote Enterprise.',
  },
  {
    id: 'c3', lead_name: 'Sofia Lopes', agent: 'River Lopes',
    date: (() => { const d = addDays(TODAY, -3); d.setHours(11,0,0,0); return d.toISOString() })(),
    type: 'Descoberta', status: 'completed', outcome: 'Qualificada',
    duration_min: 28, meet_link: null, notes: 'Budget confirmado €2.500/mês.',
  },
  {
    id: 'c4', lead_name: 'Miguel Costa', agent: 'Dex Silva',
    date: (() => { const d = addDays(TODAY, -5); d.setHours(16,0,0,0); return d.toISOString() })(),
    type: 'Proposta', status: 'no_show', outcome: null,
    duration_min: null, meet_link: null, notes: null,
  },
  {
    id: 'c5', lead_name: 'Rita Oliveira', agent: 'Quinn Costa',
    date: (() => { const d = addDays(TODAY, -7); d.setHours(9,30,0,0); return d.toISOString() })(),
    type: 'Onboarding', status: 'completed', outcome: 'Fechada ✓',
    duration_min: 52, meet_link: null, notes: 'Cliente assinado! A arrancar campanha na próxima semana.',
  },
]

const STATUS_CFG: Record<CallStatus, { label: string; color: string; icon: typeof Phone }> = {
  scheduled: { label: 'Agendada',  color: 'var(--cyan)',    icon: Clock },
  completed: { label: 'Realizada', color: 'var(--success)', icon: CheckCircle2 },
  no_show:   { label: 'Faltou',    color: 'var(--danger)',  icon: XCircle },
}

/* ── call card ── */

function CallCard({ call, selected, onSelect }: { call: PortalCall; selected: boolean; onSelect: () => void }) {
  const s    = STATUS_CFG[call.status]
  const Icon = s.icon
  const isUpcoming = call.status === 'scheduled'
  const dateLabel  = new Date(call.date).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl p-4 cursor-pointer transition-all"
      style={{
        background: 'var(--s1)',
        border: `1px solid ${selected ? 'var(--cyan)' : isUpcoming ? 'var(--cyan-border)' : 'var(--glass-border)'}`,
        boxShadow: isUpcoming ? '0 0 0 1px var(--cyan-glow)' : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--cyan-glow)', color: 'var(--cyan)' }}
          >
            {call.lead_name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{call.lead_name}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>{call.type} · {call.agent}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: s.color }}>
          <Icon size={11} />
          {s.label}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--t2)' }}>
        <span className="flex items-center gap-1"><Calendar size={10} /> {dateLabel}</span>
        <span className="flex items-center gap-1"><Clock size={10} /> {fmt(call.date)}</span>
        {call.duration_min && <span>{call.duration_min} min</span>}
      </div>

      {call.outcome && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>{call.outcome}</p>
        </div>
      )}

      {isUpcoming && call.meet_link && (
        <div className="mt-3">
          <a
            href={call.meet_link}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--lime)', color: '#0D1117' }}
          >
            <Video size={11} /> Entrar no Meet
          </a>
        </div>
      )}
    </div>
  )
}

/* ── detail panel ── */

function CallDetailPanel({ call, onClose }: { call: PortalCall; onClose: () => void }) {
  const s    = STATUS_CFG[call.status]
  const Icon = s.icon

  return (
    <div
      className="w-72 flex-shrink-0 flex flex-col animate-slide-in"
      style={{ background: 'var(--s1)', borderLeft: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--t1)', fontFamily: 'var(--font-syne)' }}>{call.lead_name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t2)' }}>{call.type}</p>
        </div>
        <button onClick={onClose}><X size={14} style={{ color: 'var(--t3)' }} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: 'var(--s2)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${s.color}20` }}
          >
            <Icon size={14} style={{ color: s.color }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{s.label}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>
              {new Date(call.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })} · {fmt(call.date)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="tag-label mb-2">Detalhes</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Agente',    value: call.agent },
              { label: 'Tipo',      value: call.type },
              { label: 'Duração',   value: call.duration_min ? `${call.duration_min} min` : '—' },
              { label: 'Resultado', value: call.outcome ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--t2)' }}>{label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {call.notes && (
          <div>
            <p className="tag-label mb-2">Notas</p>
            <p className="text-xs leading-relaxed rounded-xl p-3" style={{ color: 'var(--t2)', background: 'var(--s2)' }}>{call.notes}</p>
          </div>
        )}
      </div>

      {call.status === 'scheduled' && call.meet_link && (
        <div className="p-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <a
            href={call.meet_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'var(--lime)', color: '#0D1117' }}
          >
            <Video size={14} /> Entrar no Google Meet
          </a>
        </div>
      )}
    </div>
  )
}

/* ── page ── */

export default function PortalCallsPage() {
  const [selectedCall, setSelectedCall] = useState<PortalCall | null>(null)
  const [filter, setFilter] = useState<CallStatus | 'all'>('all')

  const upcoming  = MOCK_CALLS.filter(c => c.status === 'scheduled')
  const completed = MOCK_CALLS.filter(c => c.status === 'completed')
  const noShows   = MOCK_CALLS.filter(c => c.status === 'no_show')
  const showUp    = completed.length + noShows.length > 0
    ? Math.round((completed.length / (completed.length + noShows.length)) * 100) : 0

  const filtered = MOCK_CALLS.filter(c => filter === 'all' || c.status === filter)

  return (
    <div className="flex h-full gap-0 animate-fade-in">
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Header */}
        <div>
          <h1 className="page-title">Calls</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t2)' }}>
            {upcoming.length} agendadas · taxa show-up {showUp}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Agendadas',  value: upcoming.length,  color: 'var(--cyan)'    },
            { label: 'Realizadas', value: completed.length, color: 'var(--success)' },
            { label: 'No-show',    value: noShows.length,   color: 'var(--danger)'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="card border p-4" style={{ borderColor: 'var(--glass-border)' }}>
              <p className="num-lg">{value}</p>
              <p className="text-xs mt-0.5 font-bold" style={{ color }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex rounded-xl overflow-hidden w-fit" style={{ background: 'var(--s2)', border: '1px solid var(--glass-border)' }}>
          {(['all', 'scheduled', 'completed', 'no_show'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 text-xs font-bold transition-colors"
              style={{
                background: filter === f ? 'var(--cyan)' : 'transparent',
                color: filter === f ? '#0D1117' : 'var(--t2)',
              }}
            >
              {f === 'all' ? 'Todas' : STATUS_CFG[f].label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 content-start">
          {filtered.map(call => (
            <CallCard
              key={call.id}
              call={call}
              selected={selectedCall?.id === call.id}
              onSelect={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
            />
          ))}
        </div>
      </div>

      {selectedCall && (
        <CallDetailPanel call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}
    </div>
  )
}
