'use client'

import { X, Play, Check } from 'lucide-react'
import { Playbook, CATEGORY_CFG, STATUS_CFG, CHANNEL_CFG } from './types'

interface Props {
  pb: Playbook
  onClose: () => void
  onActivate: (id: string) => void
}

export function PlaybookDrawer({ pb, onClose, onActivate }: Props) {
  const cat = CATEGORY_CFG[pb.category]
  const st  = STATUS_CFG[pb.status]

  return (
    <div
      className="w-[440px] flex-shrink-0 flex flex-col animate-slide-in"
      style={{ background: 'var(--s1)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{cat.emoji}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cat.color}18`, color: cat.color }}>
              {cat.label}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${st.color}18`, color: st.color }}>
              {st.label}
            </span>
          </div>
          <h3 className="font-semibold text-base" style={{ color: 'var(--t1)' }}>{pb.name}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{pb.description}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg tonal-hover flex-shrink-0" style={{ color: 'var(--t3)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Leads inscritos', value: pb.leads_enrolled,                                              color: 'var(--cyan)'    },
            { label: 'Conclusão',       value: `${pb.completion_rate}%`, color: pb.completion_rate >= 70 ? 'var(--success)' : '#F5A623' },
            { label: 'Taxa de fecho',   value: pb.avg_close_rate > 0 ? `${pb.avg_close_rate}%` : '—',         color: '#D1FF00'         },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--s2)' }}>
              <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Steps timeline */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>
            Sequência — {pb.steps.length} passos · {pb.duration_days} dias
          </p>
          <div className="flex flex-col gap-0">
            {pb.steps.map((step, i) => {
              const ch     = CHANNEL_CFG[step.channel]
              const Icon   = ch.icon
              const isLast = i === pb.steps.length - 1
              return (
                <div key={step.id} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                      style={{ background: `${ch.color}15`, border: `1px solid ${ch.color}30` }}
                    >
                      <Icon size={13} style={{ color: ch.color }} />
                    </div>
                    {!isLast && <div className="w-px flex-1 my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />}
                  </div>
                  {/* Content */}
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>
                        Dia {step.day}
                      </span>
                      <span className="text-[10px]" style={{ color: ch.color }}>{ch.label}</span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>{step.action}</p>
                    {step.template && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>template: {step.template}</p>
                    )}
                    <p className="text-[10px]" style={{ color: 'var(--t3)' }}>~{step.duration_min} min</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        {pb.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pb.tags.map(t => (
              <span key={t} className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Activate CTA */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {pb.status === 'active' ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)' }}>
            <Check size={14} style={{ color: 'var(--success)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Playbook activo — {pb.leads_enrolled} leads inscritos</p>
          </div>
        ) : (
          <button
            onClick={() => onActivate(pb.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'var(--cyan)', color: '#0D1117' }}
          >
            <Play size={14} />
            Activar playbook
          </button>
        )}
      </div>
    </div>
  )
}
