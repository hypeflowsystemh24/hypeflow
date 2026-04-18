'use client'

import { Play, Check, Users, Clock, Target } from 'lucide-react'
import { Playbook, CATEGORY_CFG, STATUS_CFG, CHANNEL_CFG } from './types'

interface Props {
  pb: Playbook
  selected: boolean
  onClick: () => void
  onActivate: (id: string) => void
}

export function PlaybookCard({ pb, selected, onClick, onActivate }: Props) {
  const cat = CATEGORY_CFG[pb.category]
  const st  = STATUS_CFG[pb.status]

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all tonal-hover"
      style={{
        background: 'var(--s1)',
        boxShadow:  selected ? '0 0 0 1.5px rgba(33,160,196,0.4)' : 'var(--shadow-card)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cat.emoji}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{pb.name}</p>
            <span className="text-[9px] font-bold" style={{ color: cat.color }}>{cat.label}</span>
          </div>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${st.color}15`, color: st.color }}
        >
          {st.label}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed"
        style={{
          color: 'var(--t3)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {pb.description}
      </p>

      {/* Step channel icons */}
      <div className="flex gap-1.5">
        {pb.steps.slice(0, 5).map((s, i) => {
          const ch   = CHANNEL_CFG[s.channel]
          const Icon = ch.icon
          return (
            <div
              key={i}
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `${ch.color}15` }}
            >
              <Icon size={10} style={{ color: ch.color }} />
            </div>
          )
        })}
        {pb.steps.length > 5 && (
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--s2)' }}>
            <span className="text-[9px] font-bold" style={{ color: 'var(--t3)' }}>+{pb.steps.length - 5}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Users size={10} style={{ color: 'var(--t3)' }} />
            <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{pb.leads_enrolled}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} style={{ color: 'var(--t3)' }} />
            <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{pb.duration_days}d</span>
          </div>
          {pb.completion_rate > 0 && (
            <div className="flex items-center gap-1">
              <Target size={10} style={{ color: 'var(--success)' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--success)' }}>{pb.completion_rate}%</span>
            </div>
          )}
        </div>

        {pb.status !== 'active' ? (
          <button
            onClick={e => { e.stopPropagation(); onActivate(pb.id) }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all"
            style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}
          >
            <Play size={9} /> Activar
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <Check size={10} style={{ color: 'var(--success)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--success)' }}>Activo</span>
          </div>
        )}
      </div>
    </div>
  )
}
