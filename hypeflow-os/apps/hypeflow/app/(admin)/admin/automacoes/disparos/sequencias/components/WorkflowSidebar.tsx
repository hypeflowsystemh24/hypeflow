'use client'

import type { DragEvent } from 'react'
import {
  Zap, MessageSquare, Mail, Phone, PhoneCall,
  Clock, GitBranch, CheckCircle,
} from 'lucide-react'
import { PALETTE, CATEGORY_LABELS, type WFNodeType, type PaletteEntry } from './types'

/* ─── icon map ─── */

const ICONS: Record<string, React.ElementType> = {
  Zap, MessageSquare, Mail, Phone, PhoneCall, Clock, GitBranch, CheckCircle,
}

function NodeChip({ entry }: { entry: PaletteEntry }) {
  const Icon = ICONS[entry.icon] ?? Zap

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/wf-node-type', entry.type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing tonal-hover transition-all"
      style={{ background: 'var(--s2)', border: `1px solid ${entry.color}22` }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${entry.color}18` }}
      >
        <Icon size={13} style={{ color: entry.color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--t1)' }}>{entry.label}</p>
        <p className="text-[10px] leading-tight" style={{ color: 'var(--t3)' }}>{entry.description}</p>
      </div>
    </div>
  )
}

/* ─── grouped by category ─── */

const CATEGORY_ORDER: PaletteEntry['category'][] = ['entrada', 'acoes', 'espera', 'condicao', 'fim']

const grouped = CATEGORY_ORDER.reduce<Record<string, PaletteEntry[]>>((acc, cat) => {
  acc[cat] = PALETTE.filter(e => e.category === cat)
  return acc
}, {})

/* ─── component ─── */

interface Props {
  /** Currently selected node type (highlights chip) */
  activeType?: WFNodeType | null
}

export function WorkflowSidebar({ activeType }: Props) {
  return (
    <div
      className="w-56 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)', background: 'var(--s0)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>Blocos</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Arraste para o canvas</p>
      </div>

      {/* Palette */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat}>
            <p
              className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
              style={{ color: 'var(--t3)' }}
            >
              {CATEGORY_LABELS[cat]}
            </p>
            <div className="flex flex-col gap-1.5">
              {grouped[cat].map(entry => (
                <NodeChip
                  key={entry.type}
                  entry={entry}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[10px] text-center" style={{ color: 'var(--t3)' }}>
          Clique num nó para configurar
        </p>
      </div>
    </div>
  )
}
