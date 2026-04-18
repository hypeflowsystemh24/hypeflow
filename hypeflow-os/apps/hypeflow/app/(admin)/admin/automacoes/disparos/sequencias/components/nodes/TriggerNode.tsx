'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Zap, AlertCircle } from 'lucide-react'
import type { WFNodeData, TriggerConfig } from '../types'

type Props = NodeProps & { data: WFNodeData }

const TRIGGER_LABELS: Record<TriggerConfig['trigger_type'], string> = {
  lead_created:    'Lead criado',
  stage_changed:   'Etapa alterada',
  score_threshold: 'Score atingido',
  webhook:         'Webhook',
  manual:          'Manual',
  schedule:        'Agendamento',
}

export const TriggerNode = memo(({ data, selected }: Props) => {
  const cfg  = data.config as TriggerConfig
  const ring = selected ? '0 0 0 2px #D1FF00' : '0 0 0 1px rgba(209,255,0,0.25)'

  return (
    <div
      className="rounded-2xl px-4 py-3 min-w-[180px]"
      style={{ background: 'rgba(209,255,0,0.08)', boxShadow: ring, border: '1px solid rgba(209,255,0,0.2)' }}
    >
      {/* Icon + label */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(209,255,0,0.15)' }}>
          <Zap size={12} style={{ color: '#D1FF00' }} />
        </div>
        <span className="text-xs font-bold" style={{ color: '#D1FF00' }}>TRIGGER</span>
        {data.valid === false && <AlertCircle size={11} style={{ color: 'var(--danger)', marginLeft: 'auto' }} />}
      </div>

      {/* Config summary */}
      <p className="text-[11px] font-semibold" style={{ color: 'var(--t1)' }}>
        {TRIGGER_LABELS[cfg.trigger_type] ?? cfg.trigger_type}
      </p>
      {cfg.trigger_type === 'score_threshold' && cfg.score_value !== undefined && (
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>
          Score {cfg.score_direction === 'below' ? '<' : '>'} {cfg.score_value}
        </p>
      )}
      {cfg.trigger_type === 'stage_changed' && (cfg.stage_from || cfg.stage_to) && (
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>
          {cfg.stage_from ?? '—'} → {cfg.stage_to ?? '—'}
        </p>
      )}

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#D1FF00', border: 'none', width: 10, height: 10 }}
      />
    </div>
  )
})

TriggerNode.displayName = 'TriggerNode'
