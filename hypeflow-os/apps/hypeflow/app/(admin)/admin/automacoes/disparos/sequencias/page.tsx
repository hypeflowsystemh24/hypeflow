'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, Pause, ChevronLeft, Plus, AlertCircle,
  CheckCircle, Clock, Loader2,
} from 'lucide-react'

import { WorkflowSidebar }  from './components/WorkflowSidebar'
import { WorkflowCanvas }   from './components/WorkflowCanvas'
import { NodeConfigPanel }  from './components/NodeConfigPanel'
import { type WFNode, type WFEdge, type WorkflowStatus } from './components/types'

/* ─── Workflow list mock ─── */

const MOCK_WORKFLOWS = [
  { id: 'wf-1', name: 'Boas-vindas WhatsApp', status: 'active'  as WorkflowStatus, updated_at: '2 h atrás' },
  { id: 'wf-2', name: 'Nurturing Score Alto', status: 'paused'  as WorkflowStatus, updated_at: '1 dia'     },
  { id: 'wf-3', name: 'Re-activação 30 dias', status: 'draft'   as WorkflowStatus, updated_at: '3 dias'    },
]

const STATUS_CFG: Record<WorkflowStatus, { color: string }> = {
  active: { color: 'var(--success)' },
  paused: { color: 'var(--warning)' },
  draft:  { color: 'var(--t3)'      },
}

/* ─── initial demo canvas ─── */

const INITIAL_NODES: WFNode[] = [
  {
    id: 'n1', type: 'trigger', position: { x: 260, y: 80 },
    data: { label: 'Lead criado', config: { trigger_type: 'lead_created' }, valid: true },
  },
  {
    id: 'n2', type: 'whatsapp', position: { x: 220, y: 230 },
    data: { label: 'Boas-vindas', config: { message: 'Olá {{lead_name}}, bem-vindo!' }, valid: true },
  },
  {
    id: 'n3', type: 'delay', position: { x: 240, y: 390 },
    data: { label: 'Esperar 24h', config: { unit: 'hours', value: 24 }, valid: true },
  },
  {
    id: 'n4', type: 'condition', position: { x: 200, y: 540 },
    data: {
      label: 'Score > 70?',
      config: { field: 'score', operator: 'greater_than', value: '70', true_label: 'Sim', false_label: 'Não' },
      valid: true,
    },
  },
  {
    id: 'n5', type: 'end', position: { x: 390, y: 690 },
    data: { label: 'Convertido', config: { reason: 'converted' }, valid: true },
  },
  {
    id: 'n6', type: 'end', position: { x: 50, y: 690 },
    data: { label: 'Nurturing', config: { reason: 'completed', note: 'Continua em nurturing' }, valid: true },
  },
]

const INITIAL_EDGES: WFEdge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
  { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
  { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep', animated: true },
  { id: 'e4-5', source: 'n4', target: 'n5', sourceHandle: 'true',  type: 'smoothstep', animated: false, label: 'Sim' },
  { id: 'e4-6', source: 'n4', target: 'n6', sourceHandle: 'false', type: 'smoothstep', animated: false, label: 'Não' },
]

/* ─── page ─── */

export default function SequenciasPage() {
  const router = useRouter()

  const [wfName,     setWfName]     = useState('Boas-vindas WhatsApp')
  const [wfStatus,   setWfStatus]   = useState<WorkflowStatus>('active')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [nodes,          setNodes]          = useState<WFNode[]>(INITIAL_NODES)
  const [edges,          setEdges]          = useState<WFEdge[]>(INITIAL_EDGES)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showList,       setShowList]       = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 1200)
  }, [])

  const handleNodesUpdate = useCallback((ns: WFNode[]) => {
    setNodes(ns)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const handleEdgesUpdate = useCallback((es: WFEdge[]) => {
    setEdges(es)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const handleNodeUpdate = useCallback((nodeId: string, data: Partial<WFNode['data']>) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const canPublish   = nodes.some(n => n.type === 'trigger')
  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null

  function handlePublish() {
    if (!canPublish && wfStatus === 'draft') return
    setWfStatus(prev => prev === 'active' ? 'paused' : 'active')
  }

  return (
    <div className="flex h-full overflow-hidden animate-fade-in flex-col">

      {/* ─── Top Bar ─── */}
      <div
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--s0)' }}
      >
        <button
          onClick={() => router.push('/admin/automacoes/disparos')}
          className="tonal-hover p-1.5 rounded-xl"
          style={{ color: 'var(--t3)' }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Workflow selector */}
        <div className="relative">
          <button
            onClick={() => setShowList(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl tonal-hover"
            style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: STATUS_CFG[wfStatus].color }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--t1)', maxWidth: 200 }}>
              {wfName}
            </span>
          </button>

          {showList && (
            <div
              className="absolute top-full left-0 mt-1 w-64 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--s1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {MOCK_WORKFLOWS.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => { setWfName(wf.name); setWfStatus(wf.status); setShowList(false) }}
                  className="w-full flex items-center justify-between px-3 py-2.5 tonal-hover text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CFG[wf.status].color }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>{wf.name}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{wf.updated_at}</span>
                </button>
              ))}
              <div className="px-3 pb-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button className="w-full flex items-center gap-2 py-2 px-2 text-xs font-semibold tonal-hover rounded-xl" style={{ color: 'var(--cyan)' }}>
                  <Plus size={12} /> Novo workflow
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save indicator */}
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--t3)' }}>
          {saveStatus === 'saving' && <><Loader2 size={11} className="animate-spin" /> A guardar…</>}
          {saveStatus === 'saved'  && <><CheckCircle size={11} style={{ color: 'var(--success)' }} /> Guardado</>}
          {saveStatus === 'idle'   && <><Clock size={11} /> Auto-save</>}
        </div>

        <div className="flex-1" />

        {!canPublish && (
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--warning)' }}>
            <AlertCircle size={12} /> Adicione um trigger
          </div>
        )}

        <button
          onClick={handlePublish}
          disabled={!canPublish && wfStatus === 'draft'}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: wfStatus === 'active' ? 'rgba(239,68,68,0.12)' : canPublish ? '#D1FF00' : 'var(--s2)',
            color:      wfStatus === 'active' ? 'var(--danger)' : canPublish ? '#0D1117' : 'var(--t3)',
          }}
        >
          {wfStatus === 'active'
            ? <><Pause size={12} /> Pausar</>
            : <><Play  size={12} /> Publicar</>
          }
        </button>
      </div>

      {/* ─── 3-column layout ─── */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar activeType={selectedNode?.type as any} />

        <WorkflowCanvas
          initialNodes={nodes}
          initialEdges={edges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
          onNodesUpdate={handleNodesUpdate}
          onEdgesUpdate={handleEdgesUpdate}
        />

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNodeId(null)}
            onDelete={handleNodeDelete}
          />
        )}
      </div>
    </div>
  )
}
