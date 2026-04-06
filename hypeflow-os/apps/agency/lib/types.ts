// Core domain types used across the agency app

export interface Lead {
  id: string
  agency_id: string
  client_id: string
  agent_id?: string | null
  pipeline_stage_id?: string | null
  full_name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  source: string
  source_type?: string
  status: string
  score?: number
  temperature: 'cold' | 'warm' | 'hot'
  tags?: string[]
  notes?: string | null
  stage_entered_at?: string | null
  last_contact_at?: string | null
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  agency_id: string
  pipeline_id?: string | null
  name: string
  position: number
  color?: string | null
  sla_hours?: number | null
  is_terminal: boolean
  is_won: boolean
  automation_rules?: unknown[]
  created_at: string
}

export interface Call {
  id: string
  agency_id: string
  client_id: string
  lead_id?: string | null
  agent_id?: string | null
  scheduled_at: string
  duration_min: number
  meet_link?: string | null
  calendar_event_id?: string | null
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  outcome?: string | null
  notes?: string | null
  actual_duration_min?: number | null
  completed_at?: string | null
  created_at: string
}

export interface Client {
  id: string
  agency_id: string
  name: string
  slug: string
  niche: string
  logo_url?: string | null
  status: string
  health_score: number
  mrr: number
  monthly_lead_target?: number | null
  account_manager?: { id: string; full_name: string; avatar_url?: string | null } | null
}

export interface AutomationRule {
  id: string
  agency_id: string
  client_id?: string | null
  name: string
  is_active: boolean
  trigger_type: string
  trigger_config: Record<string, unknown>
  conditions: Array<{ field: string; operator: string; value: unknown }>
  actions: Array<{ type: string; delay_hours: number; config: Record<string, unknown> }>
  execution_count: number
  last_executed_at?: string | null
  created_at: string
}

export interface Integration {
  id: string
  agency_id: string
  client_id?: string | null
  provider: string
  status: 'active' | 'error' | 'expired' | 'disconnected'
  last_sync?: string | null
  external_account_name?: string | null
  error_message?: string | null
}

export interface TrafficMetrics {
  id: string
  client_id: string
  date: string
  platform: string
  source_type: string
  impressions: number
  clicks: number
  leads: number
  conversions: number
  spend: number
  ctr?: number | null
  cpl?: number | null
  roas?: number | null
  platform_metrics?: Record<string, unknown>
}
