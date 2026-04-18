/** Tipos do módulo Parceiros: parceiros, leads referenciados, comissões */

export type PartnerTier   = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PartnerStatus = 'active' | 'inactive' | 'pending'
export type PartnerLeadStatus = 'referred' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface Partner {
  id: string
  agency_id: string
  name: string
  email: string
  phone?: string
  company?: string
  tier: PartnerTier
  status: PartnerStatus
  referral_code: string
  commission_pct: number
  total_leads: number
  converted_leads: number
  total_earned: number
  pending_commission: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface PartnerLead {
  id: string
  partner_id: string
  agency_id: string
  lead_id: string
  status: PartnerLeadStatus
  deal_value?: number
  referred_at: string
  converted_at?: string
  lead?: {
    id: string
    full_name: string
    score: number
    temperature: string
    pipeline_stage_id?: string
    source?: string
  }
}

export interface PartnerCommission {
  id: string
  partner_id: string
  partner_lead_id: string
  deal_value: number
  commission_pct: number
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  notes?: string
  created_at: string
  paid_at?: string
}

export interface PartnerStats {
  total_partners: number
  total_leads: number
  total_converted: number
  total_earned: number
  pending_commission: number
  by_tier: Record<PartnerTier, number>
}

export const TIER_CONFIG: Record<PartnerTier, {
  label: string
  color: string
  bg: string
  minLeads: number
  commissionRange: string
}> = {
  bronze:   { label: 'Bronze',   color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  minLeads: 0,  commissionRange: '5–8%'  },
  silver:   { label: 'Silver',   color: '#C0C0C0', bg: 'rgba(192,192,192,0.12)', minLeads: 5,  commissionRange: '8–12%' },
  gold:     { label: 'Gold',     color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   minLeads: 15, commissionRange: '12–18%'},
  platinum: { label: 'Platinum', color: '#E5E4E2', bg: 'rgba(229,228,226,0.12)', minLeads: 30, commissionRange: '18–25%'},
}
