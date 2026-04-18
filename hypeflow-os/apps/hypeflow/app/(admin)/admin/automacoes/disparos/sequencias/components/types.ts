/* ──────────────────────────────────────────────────────────────
   Workflow Builder — Shared Types
   ────────────────────────────────────────────────────────────── */

import type { Node, Edge } from '@xyflow/react'

/* ─── Node type enum ─── */

export type WFNodeType =
  | 'trigger'
  | 'whatsapp'
  | 'email'
  | 'sms'
  | 'voice'
  | 'delay'
  | 'condition'
  | 'end'

/* ─── Config shapes per node type ─── */

export interface TriggerConfig {
  trigger_type: 'lead_created' | 'stage_changed' | 'score_threshold' | 'webhook' | 'manual' | 'schedule'
  /** For stage_changed */
  stage_from?: string
  stage_to?: string
  /** For score_threshold */
  score_value?: number
  score_direction?: 'above' | 'below'
  /** For schedule */
  cron_expression?: string
}

export interface WhatsappConfig {
  template_id?: string
  message: string
  /** Variable bindings: {{lead_name}} → 'lead.name' */
  variables?: Record<string, string>
  delay_after_minutes?: number
}

export interface EmailConfig {
  subject: string
  body: string
  from_name?: string
  reply_to?: string
  variables?: Record<string, string>
}

export interface SmsConfig {
  message: string
  variables?: Record<string, string>
}

export interface VoiceConfig {
  script: string
  voice_id?: string
  max_attempts?: number
}

export interface DelayConfig {
  unit: 'minutes' | 'hours' | 'days'
  value: number
}

export interface ConditionConfig {
  field: 'score' | 'stage' | 'tag' | 'source' | 'custom'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains'
  value: string
  /** Label for the true branch handle */
  true_label?: string
  /** Label for the false branch handle */
  false_label?: string
}

export interface EndConfig {
  reason?: 'completed' | 'unsubscribed' | 'converted' | 'failed'
  note?: string
}

export type NodeConfig =
  | TriggerConfig
  | WhatsappConfig
  | EmailConfig
  | SmsConfig
  | VoiceConfig
  | DelayConfig
  | ConditionConfig
  | EndConfig

/* ─── Node data (what lives in node.data) ─── */

export interface WFNodeData extends Record<string, unknown> {
  label:  string
  config: NodeConfig
  valid?: boolean
}

/* ─── Typed React Flow node ─── */

export type WFNode = Node<WFNodeData, WFNodeType>

/* ─── Edge ─── */

export type WFEdge = Edge

/* ─── Workflow status ─── */

export type WorkflowStatus = 'draft' | 'active' | 'paused'

/* ─── Full workflow ─── */

export interface Workflow {
  id:         string
  agency_id:  string
  name:       string
  status:     WorkflowStatus
  nodes:      WFNode[]
  edges:      WFEdge[]
  created_by: string
  created_at: string
  updated_at: string
}

/* ─── Palette entry (sidebar) ─── */

export interface PaletteEntry {
  type:        WFNodeType
  label:       string
  description: string
  color:       string
  icon:        string
  category:    'entrada' | 'acoes' | 'espera' | 'condicao' | 'fim'
}

/* ─── Default configs per node type ─── */

export const DEFAULT_CONFIGS: Record<WFNodeType, NodeConfig> = {
  trigger:   { trigger_type: 'lead_created' },
  whatsapp:  { message: '' },
  email:     { subject: '', body: '' },
  sms:       { message: '' },
  voice:     { script: '' },
  delay:     { unit: 'hours', value: 1 },
  condition: { field: 'score', operator: 'greater_than', value: '70', true_label: 'Sim', false_label: 'Não' },
  end:       { reason: 'completed' },
}

/* ─── Default labels per node type ─── */

export const DEFAULT_LABELS: Record<WFNodeType, string> = {
  trigger:   'Trigger',
  whatsapp:  'WhatsApp',
  email:     'E-mail',
  sms:       'SMS',
  voice:     'Chamada',
  delay:     'Esperar',
  condition: 'Condição',
  end:       'Fim',
}

/* ─── Palette config ─── */

export const PALETTE: PaletteEntry[] = [
  {
    type: 'trigger', label: 'Trigger', icon: 'Zap',
    description: 'Inicia o workflow automaticamente',
    color: '#D1FF00', category: 'entrada',
  },
  {
    type: 'whatsapp', label: 'WhatsApp', icon: 'MessageSquare',
    description: 'Envia mensagem via WhatsApp',
    color: '#25D366', category: 'acoes',
  },
  {
    type: 'email', label: 'E-mail', icon: 'Mail',
    description: 'Envia um e-mail',
    color: '#21A0C4', category: 'acoes',
  },
  {
    type: 'sms', label: 'SMS', icon: 'Phone',
    description: 'Envia uma mensagem SMS',
    color: '#F5A623', category: 'acoes',
  },
  {
    type: 'voice', label: 'Chamada', icon: 'PhoneCall',
    description: 'Dispara uma chamada de voz',
    color: '#A855F7', category: 'acoes',
  },
  {
    type: 'delay', label: 'Esperar', icon: 'Clock',
    description: 'Pausa o fluxo por um período',
    color: '#7FA8C4', category: 'espera',
  },
  {
    type: 'condition', label: 'Condição', icon: 'GitBranch',
    description: 'Divide o fluxo com base em regras',
    color: '#F59E0B', category: 'condicao',
  },
  {
    type: 'end', label: 'Fim', icon: 'CheckCircle',
    description: 'Encerra o workflow',
    color: '#1EC87A', category: 'fim',
  },
]

/* ─── Category labels ─── */

export const CATEGORY_LABELS: Record<PaletteEntry['category'], string> = {
  entrada:   'Entrada',
  acoes:     'Ações',
  espera:    'Espera',
  condicao:  'Condição',
  fim:       'Finalização',
}
