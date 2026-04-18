'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { differenceInHours } from 'date-fns'
import { Phone, Calendar, MessageSquare, ArrowRight, Mail, ChevronRight, Mountain } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Lead, PipelineStage } from '@/lib/types'

/* ─── Hill Chart ─── */
const HILL_POSITIONS = [
  { label: 'Descoberta',   color: '#E84545', icon: '🔍' },
  { label: 'Qualificação', color: '#F5A623', icon: '🎯' },
  { label: 'Solução',      color: '#D1FF00', icon: '💡' },
  { label: 'Negociação',   color: '#00BFFF', icon: '🤝' },
  { label: 'Fecho',        color: '#00E5A0', icon: '✅' },
]

const SOURCE_MAP: Record<string, { label: string; color: string }> = {
  meta:       { label: 'META',    color: '#1877F2' },
  instagram:  { label: 'IG',     color: '#E1306C' },
  google_ads: { label: 'GG',     color: '#4285F4' },
  linkedin:   { label: 'LI',     color: '#0A66C2' },
  whatsapp:   { label: 'WA',     color: '#25D366' },
  organic:    { label: 'ORG',    color: '#00E5A0' },
  email:      { label: 'EMAIL',  color: '#F5A623' },
}

const TEMP_CONFIG: Record<string, { color: string; label: string }> = {
  cold: { color: '#4A6680', label: 'COLD' },
  warm: { color: '#F5A623', label: 'WARM' },
  hot:  { color: '#E84545', label: 'HOT'  },
}

interface KanbanCardProps {
  lead: Lead
  stage?: PipelineStage
  allStages?: PipelineStage[]
  isDragging?: boolean
  onAdvance?: (leadId: string) => void
  onQuickMove?: (leadId: string, stageId: string) => void
  onClick?: (lead: Lead) => void
}

export function KanbanCard({ lead, stage, allStages = [], isDragging = false, onAdvance, onQuickMove, onClick }: KanbanCardProps) {
  const [showStagePicker, setShowStagePicker] = useState(false)
  const [hillPos, setHillPos] = useState(0)   // 0–4
  const [showHill, setShowHill] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const hillPos_ = HILL_POSITIONS[hillPos] ?? HILL_POSITIONS[0]!

  useEffect(() => {
    if (!showStagePicker) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowStagePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showStagePicker])
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.15 : 1,
  }

  const hoursInStage = lead.stage_entered_at
    ? differenceInHours(new Date(), new Date(lead.stage_entered_at))
    : 0
  const isSlaBreached = stage?.sla_hours ? hoursInStage > stage.sla_hours : false

  const temp = lead.temperature ?? 'cold'
  const tempCfg = TEMP_CONFIG[temp] ?? TEMP_CONFIG.cold!
  const src = SOURCE_MAP[lead.source] ?? { label: lead.source?.slice(0, 3).toUpperCase() ?? 'SRC', color: 'var(--t3)' }
  const score = lead.score ?? 0
  const scoreColor = score >= 80 ? '#00E5A0' : score >= 50 ? '#F5A623' : '#4A6680'
  const phone = (lead.phone ?? '').replace(/\D/g, '')

  const tagValue = lead.tags?.find(t => t.startsWith('deal_value:'))
  const dealValue = tagValue ? Number(tagValue.replace('deal_value:', '')) : null

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? 'var(--s3)' : 'var(--s2)',
        borderLeft: `3px solid ${isSlaBreached ? '#E84545' : tempCfg.color}`,
        boxShadow: isDragging
          ? '0 16px 48px rgba(0,0,0,0.5)'
          : isSlaBreached
          ? '0 0 0 1px rgba(232,69,69,0.2)'
          : '0 1px 3px rgba(0,0,0,0.2)',
      }}
      {...attributes}
      {...listeners}
      className="group relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onClick={() => onClick?.(lead)}
    >
      {/* Hill band — top color strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
        style={{ background: hillPos_.color, opacity: 0.85 }}
      />

      <div className="p-3 pt-[10px]">

      {/* SLA badge */}
      {isSlaBreached && (
        <div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: '#E84545', zIndex: 1 }}
        >
          <span className="text-[8px] text-white font-black leading-none">!</span>
        </div>
      )}

      {/* Header row: name + source */}
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <p className="text-sm font-semibold leading-tight flex-1 min-w-0 truncate" style={{ color: 'var(--t1)' }}>
          {lead.full_name}
        </p>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${src.color}18`, color: src.color }}
        >
          {src.label}
        </span>
      </div>

      {/* Company */}
      {lead.company && (
        <p className="text-[11px] mb-2 truncate" style={{ color: 'var(--t3)' }}>{lead.company}</p>
      )}

      {/* Score bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
          <div
            className="h-1 rounded-full"
            style={{ width: `${score}%`, background: scoreColor }}
          />
        </div>
        <span className="text-[11px] font-bold w-7 text-right" style={{ color: scoreColor }}>{score}</span>
      </div>

      {/* Footer: temp + time + deal value */}
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: `${tempCfg.color}18`, color: tempCfg.color }}
        >
          {tempCfg.label}
        </span>
        <div className="flex items-center gap-2">
          {dealValue && (
            <span className="text-[10px] font-bold" style={{ color: '#D1FF00' }}>
              €{dealValue >= 1000 ? `${(dealValue / 1000).toFixed(1)}k` : dealValue}
            </span>
          )}
          <span
            className="text-[10px]"
            style={{ color: isSlaBreached ? '#E84545' : 'var(--t3)' }}
          >
            {hoursInStage < 24 ? `${hoursInStage}h` : `${Math.floor(hoursInStage / 24)}d`}
            {isSlaBreached && ' ⚠'}
          </span>
        </div>
      </div>

      {/* Hill picker — inline when open */}
      {showHill && (
        <div
          className="flex gap-0.5 mt-2 mb-0.5"
          onPointerDown={e => e.stopPropagation()}
        >
          {HILL_POSITIONS.map((hp, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setHillPos(i); setShowHill(false) }}
              title={hp.label}
              className="flex-1 rounded py-1 text-[9px] font-bold transition-all"
              style={{
                background: i === hillPos ? `${hp.color}25` : 'rgba(255,255,255,0.04)',
                color: i === hillPos ? hp.color : 'var(--t3)',
                border: i === hillPos ? `1px solid ${hp.color}55` : '1px solid transparent',
              }}
            >
              {hp.icon}
            </button>
          ))}
        </div>
      )}

      {/* Quick actions — hover reveal */}
      <div
        className="flex gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ pointerEvents: 'none' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.pointerEvents = 'auto')}
      >
        <a
          href={phone ? `https://wa.me/${phone}` : '#'}
          target="_blank"
          rel="noreferrer"
          title="WhatsApp"
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg"
          style={{ background: 'var(--s3)', color: '#25D366' }}
        >
          <MessageSquare size={11} />
        </a>
        <a
          href={phone ? `tel:${phone}` : '#'}
          title="Ligar"
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg"
          style={{ background: 'var(--s3)', color: '#D1FF00' }}
        >
          <Phone size={11} />
        </a>
        <a
          href={lead.email ? `mailto:${lead.email}` : '#'}
          title="Email"
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg"
          style={{ background: 'var(--s3)', color: 'var(--cyan)' }}
        >
          <Mail size={11} />
        </a>
        <button
          title="Agendar"
          onPointerDown={e => e.stopPropagation()}
          className="p-1.5 rounded-lg"
          style={{ background: 'var(--s3)', color: '#9B59B6' }}
        >
          <Calendar size={11} />
        </button>
        {/* Hill position button */}
        <button
          title={`Posição: ${hillPos_.label}`}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setShowHill(v => !v) }}
          className="p-1.5 rounded-lg"
          style={{
            background: showHill ? `${hillPos_.color}20` : 'var(--s3)',
            color: hillPos_.color,
          }}
        >
          <Mountain size={11} />
        </button>

        <button
          title="Avançar etapa"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onAdvance?.(lead.id) }}
          className="p-1.5 rounded-lg ml-auto"
          style={{ background: 'rgba(33,160,196,0.15)', color: 'var(--cyan)' }}
        >
          <ArrowRight size={11} />
        </button>

        {/* Quick stage picker */}
        {allStages.length > 0 && (
          <div className="relative" ref={pickerRef}>
            <button
              title="Mover para etapa"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setShowStagePicker(v => !v) }}
              className="p-1.5 rounded-lg"
              style={{
                background: showStagePicker ? 'rgba(209,255,0,0.15)' : 'var(--s3)',
                color: showStagePicker ? '#D1FF00' : 'var(--t3)',
              }}
            >
              <ChevronRight size={11} />
            </button>

            {showStagePicker && (
              <div
                className="absolute bottom-full right-0 mb-1.5 rounded-xl overflow-hidden z-50 flex flex-col"
                style={{
                  background: 'var(--s2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  minWidth: 160,
                }}
                onPointerDown={e => e.stopPropagation()}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5" style={{ color: 'var(--t3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Mover para
                </p>
                {allStages.map(s => (
                  <button
                    key={s.id}
                    onClick={e => {
                      e.stopPropagation()
                      onQuickMove?.(lead.id, s.id)
                      setShowStagePicker(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-left w-full transition-colors"
                    style={{
                      background: s.id === stage?.id ? `${s.color}12` : 'transparent',
                      color: s.id === stage?.id ? s.color : 'var(--t2)',
                    }}
                    onMouseEnter={e => { if (s.id !== stage?.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (s.id !== stage?.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs truncate">{s.name}</span>
                    {s.id === stage?.id && <span className="text-[9px] ml-auto" style={{ color: 'var(--t3)' }}>atual</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>{/* end inner p-3 */}
    </div>
  )
}
