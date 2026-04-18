/** Tipos do módulo Clientes (portal de cliente / gestão de clientes) */

export interface Client {
  id: string
  agency_id: string
  full_name: string
  company?: string
  email: string
  phone?: string
  avatar_url?: string
  status: 'active' | 'inactive' | 'churned'
  plan?: string
  mrr?: number
  health_score?: number
  portal_access: boolean
  created_at: string
  updated_at: string
}

export interface ClientMessage {
  id: string
  client_id: string
  agency_id: string
  author_id: string
  author_type: 'agent' | 'client'
  type: 'briefing' | 'aprovacao' | 'relatorio' | 'estrategia' | 'outro'
  subject: string
  content: string
  visible_to_client: boolean
  created_at: string
}

export interface ClientDoor {
  id: string
  client_id: string
  agency_id: string
  label: string
  url: string
  created_at: string
}

export interface ClientNote {
  id: string
  client_id: string
  agency_id: string
  user_id: string
  content: string
  created_at: string
}
