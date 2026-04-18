/** Tipos do Portal de Cliente (área do cliente) */

export interface PortalLead {
  id: string
  full_name: string
  score: number
  temperature: 'hot' | 'warm' | 'cold'
  pipeline_stage_id?: string
  created_at: string
}

export interface PortalKpi {
  label: string
  value: number | string
  trend?: number   // percentagem de variação vs período anterior
  unit?: string
}

export interface PortalRoiSummary {
  invested: number
  revenue: number
  roi_pct: number
  leads_total: number
  leads_converted: number
  conversion_rate: number
}

export interface PortalCall {
  id: string
  lead_id: string
  status: 'scheduled' | 'completed' | 'no_show'
  scheduled_at: string
  duration_seconds?: number
  outcome?: string
}

export interface PortalConversation {
  id: string
  channel: string
  subject?: string
  last_message?: string
  last_message_at: string
  status: 'open' | 'pending' | 'closed'
}
