'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, Pause, ChevronLeft, Plus, AlertCircle,
  CheckCircle, Clock, Loader2, Zap, History, X, Edit2,
} from 'lucide-react'

import { WorkflowSidebar }  from './WorkflowSidebar'
import { WorkflowCanvas }   from './WorkflowCanvas'
import { NodeConfigPanel }  from './NodeConfigPanel'
import { type WFNode, type WFEdge, type WorkflowStatus } from './types'
import { api } from '@/lib/trpc/client'

const STATUS_CFG: Record<WorkflowStatus, { color: string }> = {
  active: { color: 'var(--success)' },
  paused: { color: 'var(--warning)' },
  draft:  { color: 'var(--t3)'      },
}

/* ─── demo canvas shown when no workflow is loaded ─── */
const INITIAL_NODES: WFNode[] = [
  { id: 'n1', type: 'trigger',   position: { x: 260, y: 80  }, data: { label: 'Lead criado',  config: { trigger_type: 'lead_created' }, valid: true } },
  { id: 'n2', type: 'whatsapp',  position: { x: 220, y: 230 }, data: { label: 'Boas-vindas',  config: { message: 'Olá {{full_name}}, bem-vindo!' }, valid: true } },
  { id: 'n3', type: 'delay',     position: { x: 240, y: 390 }, data: { label: 'Esperar 24h',  config: { unit: 'hours', value: 24 }, valid: true } },
  { id: 'n4', type: 'condition', position: { x: 200, y: 540 }, data: { label: 'Score > 70?',  config: { field: 'score', operator: 'greater_than', value: '70', true_label: 'Sim', false_label: 'Não' }, valid: true } },
  { id: 'n5', type: 'end',       position: { x: 390, y: 690 }, data: { label: 'Convertido',   config: { reason: 'converted' }, valid: true } },
  { id: 'n6', type: 'end',       position: { x: 50,  y: 690 }, data: { label: 'Nurturing',    config: { reason: 'completed' }, valid: true } },
]
const INITIAL_EDGES: WFEdge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
  { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
  { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep', animated: true },
  { id: 'e4-5', source: 'n4', target: 'n5', sourceHandle: 'true',  type: 'smoothstep', label: 'Sim' },
  { id: 'e4-6', source: 'n4', target: 'n6', sourceHandle: 'false', type: 'smoothstep', label: 'Não' },
]

/* ────────────────────────────────────────────────── */

interface Props { agencyId: string }

export function SequenciasBuilder({ agencyId }: Props) {
  const router = useRouter()

  /* ─── workflow list ─── */
  const { data: wfListData, refetch: refetchList } = api.admin.workflows.list.useQuery(
    { agencyId, limit: 50 },
    { staleTime: 30_000 },
  )
  const wfList = wfListData?.workflows ?? []

  /* ─── current workflow ─── */
  const [currentWfId, setCurrentWfId] = useState<string | null>(null)
  const currentWfIdRef = useRef<string | null>(null)

  const { data: currentWf } = api.admin.workflows.getById.useQuery(
    { id: currentWfId! },
    { enabled: !!currentWfId, staleTime: 0 },
  )

  /* ─── canvas state ─── */
  const [wfName,         setWfName]         = useState('Novo Workflow')
  const [wfStatus,       setWfStatus]       = useState<WorkflowStatus>('draft')
  const [saveStatus,     setSaveStatus]     = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [nodes,          setNodes]          = useState<WFNode[]>(INITIAL_NODES)
  const [edges,          setEdges]          = useState<WFEdge[]>(INITIAL_EDGES)
  const [canvasKey,      setCanvasKey]      = useState(0)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [showList,       setShowList]       = useState(false)
  const [showRuns,       setShowRuns]       = useState(false)
  const [editingName,    setEditingName]    = useState(false)
  const [testStatus,     setTestStatus]     = useState<'idle' | 'running' | 'done' | 'error'>('idle')

  /* refs for latest values in auto-save callback */
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const nameRef  = useRef(wfName)
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])
  useEffect(() => { nameRef.current  = wfName }, [wfName])

  /* ─── load workflow into canvas when selection changes ─── */
  useEffect(() => {
    if (!currentWf) return
    const newNodes = (currentWf.nodes as unknown as WFNode[]) ?? []
    const newEdges = (currentWf.edges as unknown as WFEdge[]) ?? []
    setNodes(newNodes)
    setEdges(newEdges)
    setWfName(currentWf.name)
    setWfStatus(currentWf.status as WorkflowStatus)
    setSaveStatus('idle')
    setSelectedNodeId(null)
    setCanvasKey(k => k + 1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWf?.id])

  /* ─── auto-select first workflow once list loads ─── */
  useEffect(() => {
    if (!currentWfId && wfList.length > 0) {
      const first = wfList[0]!
      currentWfIdRef.current = first.id
      setCurrentWfId(first.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wfList.length])

  /* ─── mutations ─── */
  const saveMutation    = api.admin.workflows.save.useMutation()
  const publishMutation = api.admin.workflows.publish.useMutation()
  const pauseMutation   = api.admin.workflows.pause.useMutation()
  const createMutation  = api.admin.workflows.create.useMutation()

  /* ─── runs ─── */
  const { data: runs, refetch: refetchRuns } = api.admin.workflows.listRuns.useQuery(
    { workflowId: currentWfId! },
    { enabled: !!currentWfId && showRuns, staleTime: 5_000 },
  )

  /* ─── auto-save ─── */
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleAutoSave = useCallback(() => {
    if (!currentWfIdRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await saveMutation.mutateAsync({
          id:    currentWfIdRef.current!,
          name:  nameRef.current,
          nodes: nodesRef.current,
          edges: edgesRef.current.map(e => ({
            id:           e.id,
            source:       e.source,
            target:       e.target,
            label:        typeof e.label === 'string' ? e.label : undefined,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined,
          })),
        })
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 1500)
  }, [saveMutation])

  /* ─── canvas handlers ─── */
  const handleNodesUpdate = useCallback((ns: WFNode[]) => { setNodes(ns); scheduleAutoSave() }, [scheduleAutoSave])
  const handleEdgesUpdate = useCallback((es: WFEdge[]) => { setEdges(es); scheduleAutoSave() }, [scheduleAutoSave])
  const handleNodeUpdate  = useCallback((nodeId: string, data: Partial<WFNode['data']>) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    scheduleAutoSave()
  }, [scheduleAutoSave])
  const handleNodeDelete  = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  /* ─── publish / pause ─── */
  async function handlePublish() {
    if (!currentWfId) return
    try {
      if (wfStatus === 'active') {
        await pauseMutation.mutateAsync({ id: currentWfId })
        setWfStatus('paused')
      } else {
        await publishMutation.mutateAsync({ id: currentWfId })
        setWfStatus('active')
      }
      refetchList()
    } catch { /* errors surfaced by React Query */ }
  }

  /* ─── create new workflow ─── */
  async function handleCreateWorkflow() {
    try {
      const wf = await createMutation.mutateAsync({ agencyId, name: 'Novo Workflow', nodes: [], edges: [] })
      await refetchList()
      currentWfIdRef.current = wf.id
      setCurrentWfId(wf.id)
      setWfName(wf.name)
      setWfStatus('draft')
      setNodes([])
      setEdges([])
      setCanvasKey(k => k + 1)
      setSaveStatus('idle')
      setShowList(false)
    } catch { /* ignore */ }
  }

  /* ─── manual test trigger ─── */
  async function handleTestTrigger() {
    if (!currentWfId) return
    setTestStatus('running')
    const triggerNode = nodes.find(n => n.type === 'trigger')
    const triggerType = (triggerNode?.data.config as { trigger_type?: string })?.trigger_type ?? 'manual'
    try {
      const res = await fetch(`${window.location.origin}/api/workflows/trigger`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ trigger_type: triggerType, agency_id: agencyId, lead: { full_name: 'Lead Teste', email: 'teste@hypeflow.pt' } }),
      })
      setTestStatus(res.ok ? 'done' : 'error')
      if (res.ok) { setShowRuns(true); refetchRuns() }
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  const canPublish   = nodes.some(n => n.type === 'trigger')
  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null
  const isBusy       = publishMutation.isPending || pauseMutation.isPending

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
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_CFG[wfStatus].color }} />
            {editingName ? (
              <input
                autoFocus
                value={wfName}
                onChange={e => setWfName(e.target.value)}
                onBlur={() => { setEditingName(false); scheduleAutoSave() }}
                onKeyDown={e => { if (e.key === 'Enter') { setEditingName(false); scheduleAutoSave() } }}
                onClick={e => e.stopPropagation()}
                className="text-sm font-semibold bg-transparent outline-none"
                style={{ color: 'var(--t1)', maxWidth: 180 }}
              />
            ) : (
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--t1)', maxWidth: 180 }}>
                {wfName}
              </span>
            )}
            <Edit2
              size={11}
              style={{ color: 'var(--t3)', flexShrink: 0 }}
              onClick={e => { e.stopPropagation(); setEditingName(true) }}
            />
          </button>

          {showList && (
            <div
              className="absolute top-full left-0 mt-1 w-72 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--s1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {wfList.length === 0 ? (
                <div className="px-4 py-3 text-xs" style={{ color: 'var(--t3)' }}>
                  Nenhum workflow criado ainda.
                </div>
              ) : wfList.map(wf => (
                <button
                  key={wf.id}
                  onClick={() => {
                    currentWfIdRef.current = wf.id
                    setCurrentWfId(wf.id)
                    setShowList(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 tonal-hover text-left"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: STATUS_CFG[(wf.status as WorkflowStatus) ?? 'draft'].color }}
                    />
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--t1)', maxWidth: 160 }}>
                      {wf.name}
                    </span>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--t3)' }}>
                    {new Date(wf.updated_at).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}
                  </span>
                </button>
              ))}
              <div className="px-3 pb-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={handleCreateWorkflow}
                  disabled={createMutation.isPending}
                  className="w-full flex items-center gap-2 py-2 px-2 text-xs font-semibold tonal-hover rounded-xl"
                  style={{ color: 'var(--cyan)' }}
                >
                  {createMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Novo workflow
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--t3)' }}>
          {saveStatus === 'saving' && <><Loader2 size={11} className="animate-spin" /> A guardar…</>}
          {saveStatus === 'saved'  && <><CheckCircle size={11} style={{ color: 'var(--success)' }} /> Guardado</>}
          {saveStatus === 'error'  && <><AlertCircle size={11} style={{ color: 'var(--danger)' }} /> Erro ao guardar</>}
          {saveStatus === 'idle'   && <><Clock size={11} /> {currentWfId ? 'Auto-save' : 'Sem workflow'}</>}
        </div>

        <div className="flex-1" />

        {/* Test button */}
        {currentWfId && (
          <button
            onClick={handleTestTrigger}
            disabled={testStatus === 'running'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              color:      testStatus === 'done' ? '#1EC87A' : testStatus === 'error' ? 'var(--danger)' : 'var(--success)',
              background: 'rgba(0,229,160,0.08)',
              border:     '1px solid rgba(0,229,160,0.15)',
            }}
          >
            {testStatus === 'running'
              ? <Loader2 size={11} className="animate-spin" />
              : <Zap size={11} />}
            {testStatus === 'done' ? 'Enviado!' : testStatus === 'error' ? 'Erro' : 'Testar'}
          </button>
        )}

        {/* Runs history toggle */}
        {currentWfId && (
          <button
            onClick={() => setShowRuns(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tonal-hover"
            style={{
              color:      showRuns ? 'var(--cyan)' : 'var(--t3)',
              background: showRuns ? 'rgba(33,160,196,0.1)' : undefined,
            }}
          >
            <History size={11} /> Histórico
          </button>
        )}

        {!canPublish && (
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--warning)' }}>
            <AlertCircle size={12} /> Adicione um trigger
          </div>
        )}

        <button
          onClick={handlePublish}
          disabled={(!canPublish && wfStatus !== 'active') || !currentWfId || isBusy}
          className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: wfStatus === 'active'
              ? 'rgba(239,68,68,0.12)'
              : canPublish && currentWfId ? '#D1FF00' : 'var(--s2)',
            color: wfStatus === 'active'
              ? 'var(--danger)'
              : canPublish && currentWfId ? '#0D1117' : 'var(--t3)',
          }}
        >
          {isBusy
            ? <Loader2 size={12} className="animate-spin" />
            : wfStatus === 'active'
              ? <><Pause size={12} /> Pausar</>
              : <><Play  size={12} /> Publicar</>
          }
        </button>
      </div>

      {/* ─── Main 3-column ─── */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar activeType={selectedNode?.type as any} />

        <WorkflowCanvas
          key={canvasKey}
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

        {/* Runs history panel — only visible when no node selected */}
        {showRuns && !selectedNode && (
          <div
            className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'var(--s0)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>Execuções</p>
              <button onClick={() => setShowRuns(false)} className="tonal-hover p-1.5 rounded-lg" style={{ color: 'var(--t3)' }}>
                <X size={12} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
              {!runs?.length ? (
                <p className="text-xs" style={{ color: 'var(--t3)' }}>
                  Nenhuma execução ainda. Clica em <strong>Testar</strong> para disparar manualmente.
                </p>
              ) : runs.map(run => (
                <div
                  key={run.id}
                  className="rounded-xl p-3 flex flex-col gap-1.5"
                  style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: run.status === 'completed' ? '#1EC87A' : run.status === 'failed' ? '#E84545' : '#F5A623',
                        background: run.status === 'completed' ? '#1EC87A15' : run.status === 'failed' ? '#E8454515' : '#F5A62315',
                      }}
                    >
                      {run.status === 'completed' ? 'OK' : run.status === 'failed' ? 'Erro' : 'Em curso'}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--t3)' }}>
                      {new Date(run.started_at as string).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {(run.error as string) && (
                    <p className="text-[10px] truncate" style={{ color: '#E84545' }}>{run.error as string}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
