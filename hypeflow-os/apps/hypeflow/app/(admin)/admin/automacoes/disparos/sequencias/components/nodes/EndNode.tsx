'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { CheckCircle } from 'lucide-react'
import type { WFNodeData, EndConfig } from '../types'

type Props = NodeProps & { data: WFNodeData }

const REASON_LABELS: Record<NonNullable<EndConfig['reason']>, string> = {
  completed:    'Concluído',
  unsubscribed: 'Descadastrado',
  converted:    'Convertido',
  failed:       'Falhou',
}

const REASON_COLORS: Record<NonNullable<EndConfig['reason']>, string> = {
  completed:    '#1EC87A',
  unsubscribed: '#7FA8C4',
  converted:    '#D1FF00',
  failed:       'var(--danger)',
}

export const EndNode = memo(({ data, selected }: Props) => {
  const cfg    = data.config as EndConfig
  const reason = cfg.reason ?? 'completed'
  const color  = REASON_COLORS[reason]
  const ring   = selected ? `0 0 0 2px ${color}` : `0 0 0 1px ${color}40`

  return (
    <div
      className="rounded-2xl px-4 py-3 min-w-[140px]"
      style={{ background: `${color}0D`, boxShadow: ring, border: `1px solid ${color}33` }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, border: 'none', width: 10, height: 10 }}
      />

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <CheckCircle size={12} style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color }}>FIM</p>
          <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{REASON_LABELS[reason]}</p>
        </div>
      </div>

      {cfg.note && (
        <p className="text-[10px] mt-1.5 line-clamp-2" style={{ color: 'var(--t3)' }}>{cfg.note}</p>
      )}
    </div>
  )
})

EndNode.displayName = 'EndNode'
