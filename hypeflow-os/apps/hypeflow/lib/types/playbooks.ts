/** Tipos do módulo Playbooks: sequências de automação de vendas */

export type PlaybookCategory = 'nurturing' | 'conversion' | 'reactivation' | 'onboarding' | 'retention'
export type PlaybookStatus   = 'active' | 'inactive' | 'draft'
export type StepChannel      = 'whatsapp' | 'email' | 'call' | 'meeting' | 'tag' | 'task' | 'wait'

export interface PlaybookStep {
  id: string
  playbook_id: string
  agency_id: string
  position: number
  day: number
  channel: StepChannel
  action: string
  content?: string
  config?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface Playbook {
  id: string
  agency_id: string
  name: string
  description?: string
  category: PlaybookCategory
  status: PlaybookStatus
  trigger_type?: string
  trigger_value?: unknown
  leads_active: number
  leads_completed: number
  conversion_rate: number
  activated_at?: string
  created_at: string
  updated_at: string
}

export interface PlaybookEnrollment {
  id: string
  playbook_id: string
  agency_id: string
  lead_id: string
  status: 'active' | 'completed' | 'paused' | 'dropped'
  current_step: number
  enrolled_at: string
  completed_at?: string
  lead?: {
    id: string
    full_name: string
    score: number
    temperature: string
  }
}

export const CATEGORY_CONFIG: Record<PlaybookCategory, {
  label: string
  emoji: string
  color: string
  bg: string
}> = {
  nurturing:    { label: 'Nurturing',    emoji: '🌱', color: '#4ade80', bg: 'rgba(74,222,128,0.10)'  },
  conversion:   { label: 'Conversão',    emoji: '🎯', color: '#f97316', bg: 'rgba(249,115,22,0.10)'  },
  reactivation: { label: 'Reactivação',  emoji: '🔄', color: '#a855f7', bg: 'rgba(168,85,247,0.10)'  },
  onboarding:   { label: 'Onboarding',   emoji: '🚀', color: '#38bdf8', bg: 'rgba(56,189,248,0.10)'  },
  retention:    { label: 'Retenção',     emoji: '💎', color: '#D1FF00', bg: 'rgba(209,255,0,0.10)'   },
}

export const CHANNEL_CONFIG: Record<StepChannel, { label: string; icon: string; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: '💬', color: '#25D366' },
  email:    { label: 'Email',    icon: '✉️',  color: '#38bdf8' },
  call:     { label: 'Chamada',  icon: '📞', color: '#f97316' },
  meeting:  { label: 'Reunião',  icon: '📅', color: '#a855f7' },
  tag:      { label: 'Tag',      icon: '🏷️',  color: '#94a3b8' },
  task:     { label: 'Tarefa',   icon: '✅', color: '#4ade80' },
  wait:     { label: 'Espera',   icon: '⏱️',  color: '#64748b' },
}
