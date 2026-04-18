'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GitBranch, AlertCircle } from 'lucide-react'
import type { WFNodeData, ConditionConfig } from '../types'

type Props = NodeProps & { data: WFNodeData }

const FIELD_LABELS: Record<ConditionConfig['field'], string> = {
  score:  'Score',
  stage:  'Etapa',
  tag:    'Tag',
  source: 'Origem',
  custom: 'Campo custom',
}

const OP_LABELS: Record<ConditionConfig['operator'], string> = {
  equals:       '=',
  not_equals:   '≠',
  greater_than: '>',
  less_than:    '<',
  contains:     'contém',
  not_contains: 'não contém',
}

export const ConditionNode = memo(({ data, selected }: Props) => {
  const cfg  = data.config as ConditionConfig
  const ring = selected ? '0 0 0 2px #F59E0B' : '0 0 0 1px rgba(245,158,11,0.25)'

  return (
    <div
      className="rounded-2xl px-4 py-3 min-w-[180px]"
      style={{ background: 'rgba(245,158,11,0.08)', boxShadow: ring, border: '1px solid rgba(245,158,11,0.2)' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#F59E0B', border: 'none', width: 10, height: 10 }}
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
          <GitBranch size={12} style={{ color: '#F59E0B' }} />
        </div>
        <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>CONDIÇÃO</span>
        {data.valid === false && <AlertCircle size={11} style={{ color: 'var(--danger)', marginLeft: 'auto' }} />}
      </div>

      <p className="text-[11px] font-semibold" style={{ color: 'var(--t1)' }}>
        {FIELD_LABELS[cfg.field]} {OP_LABELS[cfg.operator]} {cfg.value}
      </p>

      {/* True branch — right */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ background: 'var(--success)', border: 'none', width: 10, height: 10, top: '65%' }}
      />
      <span
        className="absolute text-[9px] font-bold"
        style={{ right: -30, top: '58%', color: 'var(--success)', transform: 'translateY(-50%)' }}
      >
        {cfg.true_label ?? 'Sim'}
      </span>

      {/* False branch — bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ background: 'var(--danger)', border: 'none', width: 10, height: 10 }}
      />
      <span
        className="absolute text-[9px] font-bold"
        style={{ bottom: -14, left: '50%', transform: 'translateX(-50%)', color: 'var(--danger)' }}
      >
        {cfg.false_label ?? 'Não'}
      </span>
    </div>
  )
})

ConditionNode.displayName = 'ConditionNode'
