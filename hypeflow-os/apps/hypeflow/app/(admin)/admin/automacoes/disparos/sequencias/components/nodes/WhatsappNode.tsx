'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MessageSquare, AlertCircle } from 'lucide-react'
import type { WFNodeData, WhatsappConfig } from '../types'

type Props = NodeProps & { data: WFNodeData }

export const WhatsappNode = memo(({ data, selected }: Props) => {
  const cfg  = data.config as WhatsappConfig
  const ring = selected ? '0 0 0 2px #25D366' : '0 0 0 1px rgba(37,211,102,0.25)'

  return (
    <div
      className="rounded-2xl px-4 py-3 min-w-[180px]"
      style={{ background: 'rgba(37,211,102,0.08)', boxShadow: ring, border: '1px solid rgba(37,211,102,0.2)' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#25D366', border: 'none', width: 10, height: 10 }}
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
          <MessageSquare size={12} style={{ color: '#25D366' }} />
        </div>
        <span className="text-xs font-bold" style={{ color: '#25D366' }}>WHATSAPP</span>
        {data.valid === false && <AlertCircle size={11} style={{ color: 'var(--danger)', marginLeft: 'auto' }} />}
      </div>

      <p className="text-[11px] font-semibold line-clamp-2" style={{ color: 'var(--t1)' }}>
        {cfg.message || <span style={{ color: 'var(--t3)' }}>Mensagem não definida</span>}
      </p>
      {cfg.template_id && (
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Template: {cfg.template_id}</p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#25D366', border: 'none', width: 10, height: 10 }}
      />
    </div>
  )
})

WhatsappNode.displayName = 'WhatsappNode'
