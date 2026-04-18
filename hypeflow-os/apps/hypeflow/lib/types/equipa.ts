/** Tipos do módulo Equipa: membros, check-ins, gamificação */

export interface TeamMember {
  id: string
  agency_id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  is_active: boolean
  created_at: string
}

export interface MemberActivity {
  id: string
  name: string
  avatar_url?: string
  role: string
  calls_made: number
  messages_sent: number
}

export interface CheckIn {
  id: string
  agency_id: string
  member_id: string
  questions: CheckInQuestion[]
  answers?: CheckInAnswer[]
  channel: 'whatsapp' | 'email' | 'platform'
  status: 'pending' | 'submitted'
  sent_at: string
  submitted_at?: string
  member?: Pick<TeamMember, 'id' | 'full_name' | 'avatar_url'>
}

export interface CheckInQuestion {
  id: string
  text: string
}

export interface CheckInAnswer {
  questionId: string
  answer: string
}

export interface MemberGamification {
  id: string
  agency_id: string
  member_id: string
  xp_total: number
  deals_closed: number
  calls_made: number
  score_avg: number
  updated_at: string
  member?: Pick<TeamMember, 'id' | 'full_name' | 'avatar_url' | 'role'>
}

export interface MemberBadge {
  id: string
  agency_id: string
  member_id: string
  badge_id: string
  reason?: string
  awarded_at: string
}

export type CheckInChannel = CheckIn['channel']
export type CheckInStatus  = CheckIn['status']
export type MemberRole     = TeamMember['role']
