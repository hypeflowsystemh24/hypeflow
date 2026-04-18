/** Tipos do módulo Marketing: campanhas, templates, métricas de canal */

export type CampaignStatus  = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
export type CampaignChannel = 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'sms' | 'multi'
export type CampaignType    = 'broadcast' | 'drip' | 'nurture' | 'retargeting' | 'event'

export interface AudienceFilter {
  minScore?:    number
  maxScore?:    number
  temperature?: string[]
  stages?:      string[]
  tags?:        string[]
  sourceIds?:   string[]
}

export interface Campaign {
  id: string
  agency_id: string
  name: string
  description?: string
  type: CampaignType
  channel: CampaignChannel
  status: CampaignStatus
  audience_filter?: AudienceFilter
  content?: unknown
  scheduled_at?: string
  ends_at?: string
  sent: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
  created_at: string
  updated_at: string
}

export interface CampaignMetrics {
  id: string
  campaign_id: string
  date: string
  sent: number
  opened: number
  clicked: number
  converted: number
  revenue: number
}

export interface MessageTemplate {
  id: string
  agency_id: string
  name: string
  channel: CampaignChannel
  category?: string
  subject?: string
  body: string
  variables: string[]
  created_at: string
}

export interface ChannelFunnelRow {
  channel: string
  sent: number
  opened: number
  clicked: number
  converted: number
  revenue: number
  open_rate: number
  click_rate: number
  convert_rate: number
}

export interface MarketingDashboard {
  active_campaigns: number
  total_sent: number
  open_rate: number
  click_rate: number
  convert_rate: number
  new_leads: number
  leads_by_source: Record<string, number>
}
