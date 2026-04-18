export type PartnerTier   = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PartnerStatus = 'active' | 'pending' | 'inactive'
export type PartnerLeadStatus = 'converted' | 'pipeline' | 'lost'

export interface PartnerLead {
  id: string
  name: string
  status: PartnerLeadStatus
  value: number
  date: string
}

export interface Partner {
  id: string
  name: string
  email: string
  company: string
  tier: PartnerTier
  status: PartnerStatus
  referral_code: string
  leads_sent: number
  leads_converted: number
  commission_rate: number
  commissions_earned: number
  commissions_pending: number
  since: string
  last_activity: string
  leads: PartnerLead[]
}

export const TIER_CFG: Record<PartnerTier, { label: string; color: string; bg: string; icon: string; min_leads: number; commission: string }> = {
  bronze:   { label: 'Bronze',   color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  icon: '🥉', min_leads: 1,  commission: '8-10%'  },
  silver:   { label: 'Silver',   color: '#C0C0C0', bg: 'rgba(192,192,192,0.12)', icon: '🥈', min_leads: 10, commission: '10-12%' },
  gold:     { label: 'Gold',     color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   icon: '🥇', min_leads: 25, commission: '12-15%' },
  platinum: { label: 'Platinum', color: '#D1FF00', bg: 'rgba(209,255,0,0.10)',   icon: '💎', min_leads: 50, commission: '15-20%' },
}

export const STATUS_CFG: Record<PartnerStatus, { label: string; color: string }> = {
  active:   { label: 'Activo',   color: '#1EC87A' },
  pending:  { label: 'Pendente', color: '#F5A623' },
  inactive: { label: 'Inactivo', color: '#3D6080' },
}

export const LEAD_STATUS_CFG: Record<PartnerLeadStatus, { label: string; color: string }> = {
  converted: { label: 'Convertido', color: '#1EC87A' },
  pipeline:  { label: 'Pipeline',   color: '#21A0C4' },
  lost:      { label: 'Perdido',    color: '#E84545' },
}

export const MOCK_PARTNERS: Partner[] = [
  {
    id: 'p1', name: 'Miguel Rodrigues', email: 'miguel@consultoria.pt', company: 'Consultoria MR',
    tier: 'gold', status: 'active', referral_code: 'MR-GOLD-2024',
    leads_sent: 34, leads_converted: 12, commission_rate: 15,
    commissions_earned: 4200, commissions_pending: 840,
    since: '2023-06-01', last_activity: '2026-04-14',
    leads: [
      { id: 'l1', name: 'TechVision Lda',    status: 'converted', value: 2400, date: '2026-04-10' },
      { id: 'l2', name: 'DigitalAgency Pro', status: 'pipeline',  value: 1800, date: '2026-04-12' },
      { id: 'l3', name: 'StartupX',          status: 'converted', value: 1200, date: '2026-04-08' },
    ],
  },
  {
    id: 'p2', name: 'Sara Mendes', email: 'sara@marketingpro.pt', company: 'Marketing Pro',
    tier: 'silver', status: 'active', referral_code: 'SM-SILV-2024',
    leads_sent: 18, leads_converted: 5, commission_rate: 12,
    commissions_earned: 1560, commissions_pending: 360,
    since: '2023-09-15', last_activity: '2026-04-13',
    leads: [
      { id: 'l4', name: 'E-commerce Fast', status: 'converted', value: 1800, date: '2026-04-09' },
      { id: 'l5', name: 'LocalBiz Porto',  status: 'pipeline',  value: 900,  date: '2026-04-11' },
    ],
  },
  {
    id: 'p3', name: 'Carlos Pinto', email: 'carlos@biznetwork.pt', company: 'Biz Network',
    tier: 'platinum', status: 'active', referral_code: 'CP-PLAT-2024',
    leads_sent: 67, leads_converted: 28, commission_rate: 20,
    commissions_earned: 12400, commissions_pending: 2200,
    since: '2022-11-01', last_activity: '2026-04-15',
    leads: [
      { id: 'l6', name: 'Enterprise Corp', status: 'converted', value: 4100, date: '2026-04-10' },
      { id: 'l7', name: 'SaaS Solutions',  status: 'converted', value: 3200, date: '2026-04-07' },
      { id: 'l8', name: 'Growth Agency',   status: 'pipeline',  value: 2400, date: '2026-04-14' },
    ],
  },
  {
    id: 'p4', name: 'Ana Lopes', email: 'ana.lopes@web.pt', company: 'WebPro Studio',
    tier: 'bronze', status: 'pending', referral_code: 'AL-BRNZ-2024',
    leads_sent: 4, leads_converted: 0, commission_rate: 8,
    commissions_earned: 0, commissions_pending: 0,
    since: '2026-03-20', last_activity: '2026-04-05',
    leads: [
      { id: 'l9', name: 'Restaurante Lisboa', status: 'pipeline', value: 600, date: '2026-04-03' },
    ],
  },
]
