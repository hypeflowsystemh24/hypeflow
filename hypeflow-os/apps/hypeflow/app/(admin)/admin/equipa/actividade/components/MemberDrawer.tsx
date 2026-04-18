'use client'

import { Phone, MessageSquare, Mail, Calendar, Target } from 'lucide-react'
import { MemberActivity, DAYS_LABELS, pct } from './types'

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const p        = pct(value, target)
  const exceeded = value > target
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${p}%`, background: exceeded ? 'var(--success)' : color }}
        />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color: exceeded ? 'var(--success)' : p >= 80 ? color : 'var(--t3)' }}>
        {p}%
      </span>
    </div>
  )
}

interface Props {
  member: MemberActivity
  onClose: () => void
}

export function MemberDrawer({ member, onClose }: Props) {
  const metrics = [
    { label: 'Calls feitas',   value: member.calls_made,      target: member.calls_target,    icon: Phone,         color: '#21A0C4' },
    { label: 'Reuniões',       value: member.meetings_booked, target: member.meetings_target, icon: Calendar,      color: '#F5A623' },
    { label: 'Deals fechados', value: member.deals_closed,    target: member.deals_target,    icon: Target,        color: '#1EC87A' },
    { label: 'Mensagens',      value: member.messages_sent,   target: 150,                    icon: MessageSquare, color: '#25D366' },
    { label: 'Emails',         value: member.emails_sent,     target: 40,                     icon: Mail,          color: '#4285F4' },
  ]

  return (
    <div
      className="w-[400px] flex-shrink-0 flex flex-col animate-slide-in"
      style={{ background: 'var(--s1)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold"
            style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}
          >
            {member.avatar}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>{member.name}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>{member.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Quick KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Score médio',    value: `${member.score_avg}`,          color: member.score_avg >= 80 ? 'var(--success)' : member.score_avg >= 60 ? '#F5A623' : 'var(--danger)' },
            { label: 'Tempo resposta', value: `${member.response_time_avg}m`, color: member.response_time_avg <= 20 ? 'var(--success)' : member.response_time_avg <= 40 ? '#F5A623' : 'var(--danger)' },
            { label: 'Streak',         value: `${member.login_streak}d`,      color: 'var(--cyan)' },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--s2)' }}>
              <p className="text-base font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Metrics vs targets */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>Metas do período</p>
          {metrics.map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} className="rounded-xl p-3" style={{ background: 'var(--s2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={12} style={{ color: m.color }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>{m.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--t1)' }}>
                    {m.value} <span style={{ color: 'var(--t3)' }}>/ {m.target}</span>
                  </span>
                </div>
                <ProgressBar value={m.value} target={m.target} color={m.color} />
              </div>
            )
          })}
        </div>

        {/* Daily activity chart */}
        <div className="rounded-xl p-4" style={{ background: 'var(--s2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Actividade — últimos 7 dias</p>
          <div className="flex items-end gap-1 h-16">
            {member.daily.map((v, i) => {
              const max = Math.max(...member.daily, 1)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${(v / max) * 56}px`, background: 'var(--cyan)', minHeight: 4 }}
                  />
                  <span className="text-[8px]" style={{ color: 'var(--t3)' }}>{DAYS_LABELS[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity log */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Últimas actividades</p>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: Phone,        label: 'Call realizada com Sofia Lopes',      time: '14 min atrás', color: '#21A0C4' },
              { icon: MessageSquare,label: 'WhatsApp enviado para Carlos Mendes', time: '1h atrás',     color: '#25D366' },
              { icon: Calendar,     label: 'Reunião agendada — João Silva',        time: '2h atrás',     color: '#F5A623' },
              { icon: Mail,         label: 'Email de follow-up enviado',            time: '3h atrás',     color: '#4285F4' },
              { icon: Target,       label: 'Deal fechado — Ana Ferreira',           time: '5h atrás',     color: '#1EC87A' },
            ].map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} className="flex items-center gap-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                    <Icon size={11} style={{ color: a.color }} />
                  </div>
                  <p className="text-xs flex-1" style={{ color: 'var(--t2)' }}>{a.label}</p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--t3)' }}>{a.time}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
