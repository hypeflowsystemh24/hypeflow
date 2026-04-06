'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { useState, useCallback } from 'react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import type { PipelineStage, Lead } from '@/lib/types'

/* ─── mock data ─── */

const h = (n: number) => new Date(Date.now() - n * 3600000).toISOString()
const mkLead = (id: string, full_name: string, source: string, temperature: Lead['temperature'], score: number, stageId: string, hoursAgo: number): Lead => ({
  id, full_name, source, temperature, score,
  agency_id: 'preview', client_id: 'preview-client',
  status: 'active', pipeline_stage_id: stageId,
  stage_entered_at: h(hoursAgo),
  created_at: h(hoursAgo + 48), updated_at: h(hoursAgo),
})

const MOCK_STAGES: Array<PipelineStage & { leads: Lead[] }> = [
  {
    id: 'stage-1', name: 'Nova', color: '#7FA8C4', position: 0,
    agency_id: 'preview', sla_hours: 24, is_terminal: false, is_won: false, created_at: '',
    leads: [
      mkLead('l1', 'João Silva',    'facebook',  'hot',  87, 'stage-1', 2),
      mkLead('l2', 'Ana Ferreira',  'instagram', 'warm', 62, 'stage-1', 8),
      mkLead('l3', 'Rui Carvalho',  'google',    'cold', 41, 'stage-1', 30),
    ],
  },
  {
    id: 'stage-2', name: 'Qualificando', color: '#F5A623', position: 1,
    agency_id: 'preview', sla_hours: 48, is_terminal: false, is_won: false, created_at: '',
    leads: [
      mkLead('l4', 'Carlos Mendes', 'linkedin', 'hot',  91, 'stage-2', 5),
      mkLead('l5', 'Sofia Lopes',   'whatsapp', 'warm', 74, 'stage-2', 20),
    ],
  },
  {
    id: 'stage-3', name: 'Agendada', color: '#4FC8EA', position: 2,
    agency_id: 'preview', sla_hours: 72, is_terminal: false, is_won: false, created_at: '',
    leads: [
      mkLead('l6', 'Miguel Costa',  'facebook', 'hot',  88, 'stage-3', 10),
      mkLead('l7', 'Rita Oliveira', 'google',   'warm', 66, 'stage-3', 45),
      mkLead('l8', 'Pedro Santos',  'manychat', 'cold', 53, 'stage-3', 60),
    ],
  },
  {
    id: 'stage-4', name: 'Proposta', color: '#E8A838', position: 3,
    agency_id: 'preview', sla_hours: 96, is_terminal: false, is_won: false, created_at: '',
    leads: [
      mkLead('l9',  'Inês Rodrigues', 'linkedin', 'hot',  95, 'stage-4', 12),
      mkLead('l10', 'Marta Pereira',  'email',    'warm', 78, 'stage-4', 36),
    ],
  },
  {
    id: 'stage-5', name: 'Fechada ✓', color: '#1EC87A', position: 4,
    agency_id: 'preview', sla_hours: null, is_terminal: true, is_won: true, created_at: '',
    leads: [
      mkLead('l11', 'Tiago Fonseca', 'facebook', 'hot', 99, 'stage-5', 24),
    ],
  },
]

interface KanbanBoardProps {
  agencyId: string
  clientId?: string
  agentId?: string
}

export function KanbanBoard({ agencyId, clientId, agentId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [stages, setStages] = useState<Array<PipelineStage & { leads: Lead[] }>>(MOCK_STAGES)

  // In production: replace MOCK_STAGES with tRPC query result
  // const { data } = api.pipeline.getBoard.useQuery({ agencyId, clientId, agentId })

  const updateStageMutation = { mutateAsync: async (_: unknown) => {} }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const findStageByLeadId = useCallback(
    (leadId: string) => stages.find(s => s.leads.some(l => l.id === leadId)),
    [stages]
  )

  const findLeadById = useCallback(
    (leadId: string) => {
      for (const stage of stages) {
        const lead = stage.leads.find(l => l.id === leadId)
        if (lead) return lead
      }
      return null
    },
    [stages]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeLeadId = active.id as string
      const overId = over.id as string

      const activeStage = findStageByLeadId(activeLeadId)
      const overStage = stages.find(s => s.id === overId) ?? findStageByLeadId(overId)

      if (!activeStage || !overStage || activeStage.id === overStage.id) return

      // Optimistic update — move lead visually
      setStages(prev =>
        prev.map(stage => {
          if (stage.id === activeStage.id) {
            return { ...stage, leads: stage.leads.filter(l => l.id !== activeLeadId) }
          }
          if (stage.id === overStage.id) {
            const lead = findLeadById(activeLeadId)!
            return { ...stage, leads: [...stage.leads, lead] }
          }
          return stage
        })
      )
    },
    [stages, findStageByLeadId, findLeadById]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeLeadId = active.id as string
      const overId = over.id as string
      const targetStage = stages.find(s => s.id === overId) ?? findStageByLeadId(overId)

      if (!targetStage) return

      try {
        await updateStageMutation.mutateAsync({
          leadId: activeLeadId,
          stageId: targetStage.id,
        })
      } catch {
        // In production: revert optimistic update on error
      }
    },
    [stages, findStageByLeadId, updateStageMutation]
  )

  const activeLead = activeId ? findLeadById(activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]">
        {stages.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={stage.leads}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="kanban-drag-overlay">
            <KanbanCard lead={activeLead} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
