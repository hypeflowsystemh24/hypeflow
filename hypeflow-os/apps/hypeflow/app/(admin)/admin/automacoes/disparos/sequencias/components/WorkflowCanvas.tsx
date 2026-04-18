'use client'

import { useCallback, type DragEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Connection,
  type NodeTypes,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TriggerNode, WhatsappNode, DelayNode, ConditionNode, EndNode } from './nodes'
import { DEFAULT_CONFIGS, DEFAULT_LABELS, type WFNode, type WFEdge, type WFNodeType } from './types'

/* ─── node type registry ─── */

const nodeTypes: NodeTypes = {
  trigger:   TriggerNode   as any,
  whatsapp:  WhatsappNode  as any,
  delay:     DelayNode     as any,
  condition: ConditionNode as any,
  end:       EndNode       as any,
}

/* ─── helpers ─── */

let _nodeIdCounter = 1
function newNodeId() { return `n${Date.now()}_${_nodeIdCounter++}` }

/* ─── component ─── */

interface Props {
  initialNodes:   WFNode[]
  initialEdges:   WFEdge[]
  selectedNodeId: string | null
  onNodeSelect:   (id: string | null) => void
  onNodesUpdate:  (nodes: WFNode[]) => void
  onEdgesUpdate:  (edges: WFEdge[]) => void
}

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
  selectedNodeId,
  onNodeSelect,
  onNodesUpdate,
  onEdgesUpdate,
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initialEdges)

  const handleNodesChange = useCallback((changes: NodeChange<any>[]) => {
    onNodesChange(changes)
    // after changes are applied, notify parent (next tick)
    setNodes(nds => { onNodesUpdate(nds as WFNode[]); return nds })
  }, [onNodesChange, setNodes, onNodesUpdate])

  const handleEdgesChange = useCallback((changes: EdgeChange<any>[]) => {
    onEdgesChange(changes)
    setEdges(eds => { onEdgesUpdate(eds as WFEdge[]); return eds })
  }, [onEdgesChange, setEdges, onEdgesUpdate])

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => {
      const next = addEdge({ ...params, type: 'smoothstep', animated: true }, eds)
      onEdgesUpdate(next as WFEdge[])
      return next
    })
  }, [setEdges, onEdgesUpdate])

  /* drag-and-drop from sidebar */
  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/wf-node-type') as WFNodeType
    if (!type) return

    const bounds = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const position = { x: e.clientX - bounds.left - 90, y: e.clientY - bounds.top - 30 }

    const newNode: WFNode = {
      id: newNodeId(), type, position,
      data: { label: DEFAULT_LABELS[type], config: { ...DEFAULT_CONFIGS[type] }, valid: false },
    }

    setNodes(nds => {
      const next = [...nds, newNode]
      onNodesUpdate(next as WFNode[])
      return next
    })
  }, [setNodes, onNodesUpdate])

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div className="flex-1 relative" style={{ background: 'var(--s0)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        onPaneClick={() => onNodeSelect(null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.06)" />
        <Controls
          showInteractive={false}
          style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
        />
        <MiniMap
          nodeColor={n => {
            const t = n.type as WFNodeType
            if (t === 'trigger')   return '#D1FF00'
            if (t === 'whatsapp')  return '#25D366'
            if (t === 'delay')     return '#7FA8C4'
            if (t === 'condition') return '#F59E0B'
            if (t === 'end')       return '#1EC87A'
            return '#21A0C4'
          }}
          style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}
        />
      </ReactFlow>
    </div>
  )
}
