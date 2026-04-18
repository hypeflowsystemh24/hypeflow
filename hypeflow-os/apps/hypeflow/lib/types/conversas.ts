/** Tipos do módulo Conversas: caixa de entrada multi-canal */

export type ConversationChannel = 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'sms' | 'chat'
export type ConversationStatus  = 'open' | 'pending' | 'closed'
export type MessageSenderType   = 'agent' | 'lead' | 'bot'

export interface Conversation {
  id: string
  agency_id: string
  lead_id?: string
  assignee_id?: string
  channel: ConversationChannel
  status: ConversationStatus
  subject?: string
  last_message?: string
  last_message_at: string
  unread_count: number
  last_read_at?: string
  closed_at?: string
  created_at: string
  lead?: {
    id: string
    full_name: string
    score: number
    temperature: string
    pipeline_stage_id?: string
  }
  assignee?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  agency_id: string
  sender_id: string
  sender_type: MessageSenderType
  content: string
  channel: ConversationChannel
  read_at?: string
  created_at: string
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}
