'use client'

import { useState } from 'react'
import {
  Phone, MessageSquare, Calendar, Target,
  TrendingUp, Clock, Download, Filter, ArrowUp, ArrowDown, Minus,
} from 'lucide-react'

import { MemberDrawer } from './components/MemberDrawer'
import { MemberActivity, Metric, Period, MOCK_TEAM, pct } from './components/types'

/* ─── small helpers (only used inside this file) ─── */

function TrendIcon({ trend }: { trend: MemberActivity['trend'] }) {
  if (trend === 'up')   return <ArrowUp   size={12} style={{ color: 'var(--success)' }} />
  if (trend === 'down') return <ArrowDown size={12} style={{ color: 'var(--danger)'  }} />
  return <Minus size={12} style={{ color: 'var(--t3)' }} />
}

function MiniBar({ daily, color }: { daily: number[]; color: string }) {
  const max = Math.max(...daily, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {daily.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, background: `${color}80`, minHeight: 2 }}
        />
      ))}
    </div>
  )
}

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const p        = pct(value, target)
  const exceeded = value > target
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: exceeded ? 'var(--success)' : color }} />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color: exceeded ? 'var(--success)' : p >= 80 ? color : 'var(--t3)' }}>
        {p}%
      </span>
    </div>
  )
}

/* ─── page ─── */

export default function ActividadePage() {
  const [period, setPeriod]             = useState<Period>('30d')
  const [sortMetric, setSortMetric]     = useState<Metric>('calls')
  const [selectedMember, setSelectedMember] = useState<MemberActivity | null>(null)

  const PERIOD_LABELS: Record<Period, string> = { '7d': '7 dias', '30d': '30 dias', '90d': '90 dias' }

  const sorted = [...MOCK_TEAM].sort((a, b) => {
    if (sortMetric === 'calls')    return b.calls_made       - a.calls_made
    if (sortMetric === 'messages') return b.messages_sent    - a.messages_sent
    if (sortMetric === 'meetings') return b.meetings_booked  - a.meetings_booked
    if (sortMetric === 'deals')    return b.deals_closed     - a.deals_closed
    return b.score_avg - a.score_avg
  })

  const teamTotals = {
    calls:    MOCK_TEAM.reduce((s, m) => s + m.calls_made,      0),
    messages: MOCK_TEAM.reduce((s, m) => s + m.messages_sent,   0),
    meetings: MOCK_TEAM.reduce((s, m) => s + m.meetings_booked, 0),
    deals:    MOCK_TEAM.reduce((s, m) => s + m.deals_closed,    0),
  }

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">

        {/* Page header */}
        <div className="flex items-center justify-between px-6 pt-6 flex-shrink-0">
          <div>
            <h1 className="page-title">Actividade da Equipa</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Métricas de produtividade por membro</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['7d', '30d', '90d'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{ background: period === p ? 'var(--cyan)' : 'transparent', color: period === p ? '#0D1117' : 'var(--t3)' }}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tonal-hover"
              style={{ background: 'var(--s1)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Download size={12} />
              Exportar
            </button>
          </div>
        </div>

        {/* Team KPI row */}
        <div className="grid grid-cols-4 gap-4 px-6 flex-shrink-0">
          {[
            { label: 'Calls totais',   value: teamTotals.calls,    icon: Phone,        color: '#21A0C4' },
            { label: 'Mensagens',      value: teamTotals.messages,  icon: MessageSquare,color: '#25D366' },
            { label: 'Reuniões',       value: teamTotals.meetings,  icon: Calendar,     color: '#F5A623' },
            { label: 'Deals fechados', value: teamTotals.deals,     icon: Target,       color: '#1EC87A' },
          ].map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-2xl p-4" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={14} style={{ color: k.color }} />
                  <TrendingUp size={11} style={{ color: 'var(--success)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>{k.label}</p>
              </div>
            )
          })}
        </div>

        {/* Sort toolbar */}
        <div className="flex items-center gap-2 px-6 flex-shrink-0">
          <Filter size={12} style={{ color: 'var(--t3)' }} />
          <span className="text-xs" style={{ color: 'var(--t3)' }}>Ordenar por:</span>
          {([
            { key: 'calls',    label: 'Calls'     },
            { key: 'messages', label: 'Mensagens' },
            { key: 'meetings', label: 'Reuniões'  },
            { key: 'deals',    label: 'Deals'     },
            { key: 'score',    label: 'Score'     },
          ] as { key: Metric; label: string }[]).map(s => (
            <button
              key={s.key}
              onClick={() => setSortMetric(s.key)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: sortMetric === s.key ? 'rgba(33,160,196,0.15)' : 'var(--s1)',
                color:      sortMetric === s.key ? 'var(--cyan)' : 'var(--t3)',
                border:     `1px solid ${sortMetric === s.key ? 'rgba(33,160,196,0.3)' : 'transparent'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Team table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex flex-col gap-3">
            {sorted.map((member, rank) => {
              const callPct    = pct(member.calls_made,       member.calls_target)
              const meetPct    = pct(member.meetings_booked,  member.meetings_target)
              const dealPct    = pct(member.deals_closed,     member.deals_target)
              const isSelected = selectedMember?.id === member.id

              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(isSelected ? null : member)}
                  className="text-left rounded-2xl p-4 transition-all tonal-hover"
                  style={{ background: 'var(--s1)', boxShadow: isSelected ? '0 0 0 1.5px rgba(33,160,196,0.4)' : 'var(--shadow-card)' }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <span className="text-sm font-bold w-6 text-center flex-shrink-0" style={{ color: rank === 0 ? '#D1FF00' : rank === 1 ? '#7FA8C4' : 'var(--t3)' }}>
                      #{rank + 1}
                    </span>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>
                      {member.avatar}
                    </div>

                    {/* Name + role */}
                    <div className="w-36 flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{member.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{member.role}</p>
                    </div>

                    {/* Metrics */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      {[
                        { label: 'Calls',    value: member.calls_made,      target: member.calls_target,    p: callPct, color: '#21A0C4' },
                        { label: 'Reuniões', value: member.meetings_booked, target: member.meetings_target, p: meetPct, color: '#F5A623' },
                        { label: 'Deals',    value: member.deals_closed,    target: member.deals_target,    p: dealPct, color: '#1EC87A' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{m.label}</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>
                              {m.value}<span style={{ color: 'var(--t3)' }}>/{m.target}</span>
                            </span>
                          </div>
                          <ProgressBar value={m.value} target={m.target} color={m.color} />
                        </div>
                      ))}
                    </div>

                    {/* Mini bar chart */}
                    <div className="w-20 flex-shrink-0">
                      <MiniBar daily={member.daily} color="var(--cyan)" />
                    </div>

                    {/* Score + trend */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: member.score_avg >= 80 ? 'var(--success)' : member.score_avg >= 60 ? '#F5A623' : 'var(--danger)' }}>
                          {member.score_avg}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--t3)' }}>score</p>
                      </div>
                      <TrendIcon trend={member.trend} />
                    </div>

                    {/* Response time */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Clock size={11} style={{ color: 'var(--t3)' }} />
                      <span className="text-xs font-semibold" style={{ color: member.response_time_avg <= 20 ? 'var(--success)' : member.response_time_avg <= 40 ? '#F5A623' : 'var(--danger)' }}>
                        {member.response_time_avg}m
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Member detail drawer */}
      {selectedMember && (
        <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  )
}
