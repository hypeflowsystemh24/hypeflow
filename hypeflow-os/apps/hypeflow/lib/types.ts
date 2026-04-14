export interface Lead {
  id: string
  full_name: string
  source: string
  temperature: 'hot' | 'warm' | 'cold'
  score: number
  agency_id: string
  client_id?: string
  status: 'active' | 'inactive' | 'won' | 'lost'
  pipeline_stage_id?: string
  stage_entered_at?: string
  created_at: string
  updated_at: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  tags?: string[]
  assignee_id?: string
  last_contact_at?: string
  tfc_minutes?: number
  is_hot?: boolean
  source_type?: string
}

export interface PipelineStage {
  id: string
  name: string
  color: string
  position: number
  agency_id: string
  sla_hours?: number
  is_terminal: boolean
  is_won: boolean
  created_at: string
}
