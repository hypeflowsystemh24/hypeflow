'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Clock } from 'lucide-react'
import type { WFNodeData, DelayConfig } from '../types'

type Props = NodeProps & { data: WFNodeData }

const UNIT_LABELS: Record<DelayConfig['unit'], string> = {
  minutes: 'minuto(s)',
  hours:   'hora(s)',
  days:    'dia(s)',
}

export const DelayNode = memo(({ data, selected }: Props) => {
  const cfg  = data.config as DelayConfig
  const ring = selected ? '0 0 0 2px #7FA8C4' : '0 0 0 1px rgba(127,168,196,0.25)'

  return (
    <div
      className="rounded-2xl px-4 py-3 min-w-[160px]"
      style={{ background: 'rgba(127,168,196,0.08)', boxShadow: ring, border: '1px solid rgba(127,168,196,0.2)' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#7FA8C4', border: 'none', width: 10, height: 10 }}
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(127,168,196,0.15)' }}>
          <Clock size={12} style={{ color: '#7FA8C4' }} />
        </div>
        <span className="text-xs font-bold" style={{ color: '#7FA8C4' }}>ESPERAR</span>
      </div>

      <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>
        {cfg.value} {UNIT_LABELS[cfg.unit] ?? cfg.unit}
      </p>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#7FA8C4', border: 'none', width: 10, height: 10 }}
      />
    </div>
  )
})

DelayNode.displayName = 'DelayNode'
