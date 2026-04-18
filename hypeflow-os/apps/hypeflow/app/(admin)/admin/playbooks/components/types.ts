import { MessageSquare, Mail, Phone, Calendar, Tag } from 'lucide-react'

export type PlaybookCategory = 'prospecção' | 'qualificação' | 'negociação' | 'reactivação' | 'onboarding'
export type PlaybookStatus   = 'active' | 'inactive' | 'draft'
export type StepChannel      = 'whatsapp' | 'email' | 'call' | 'meeting' | 'tag'

export interface PlaybookStep {
  id: string
  day: number
  channel: StepChannel
  action: string
  template?: string
  duration_min: number
}

export interface Playbook {
  id: string
  name: string
  description: string
  category: PlaybookCategory
  status: PlaybookStatus
  steps: PlaybookStep[]
  leads_enrolled: number
  completion_rate: number
  avg_close_rate: number
  duration_days: number
  author: string
  tags: string[]
  featured: boolean
}

export const CATEGORY_CFG: Record<PlaybookCategory, { label: string; color: string; emoji: string }> = {
  prospecção:   { label: 'Prospecção',   color: '#21A0C4', emoji: '🎯' },
  qualificação: { label: 'Qualificação', color: '#F5A623', emoji: '⭐' },
  negociação:   { label: 'Negociação',   color: '#D1FF00', emoji: '🤝' },
  reactivação:  { label: 'Reactivação',  color: '#A855F7', emoji: '🔄' },
  onboarding:   { label: 'Onboarding',   color: '#1EC87A', emoji: '🚀' },
}

export const STATUS_CFG: Record<PlaybookStatus, { label: string; color: string }> = {
  active:   { label: 'Activo',   color: '#1EC87A' },
  inactive: { label: 'Inactivo', color: '#3D6080' },
  draft:    { label: 'Rascunho', color: '#F5A623' },
}

export const CHANNEL_CFG: Record<StepChannel, { icon: typeof MessageSquare; color: string; label: string }> = {
  whatsapp: { icon: MessageSquare, color: '#25D366', label: 'WhatsApp' },
  email:    { icon: Mail,          color: '#4285F4', label: 'Email'    },
  call:     { icon: Phone,         color: '#21A0C4', label: 'Call'     },
  meeting:  { icon: Calendar,      color: '#F5A623', label: 'Reunião'  },
  tag:      { icon: Tag,           color: '#7FA8C4', label: 'Tag'      },
}

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb1',
    name: 'Boas-vindas Cross-Canal',
    description: 'Sequência de 5 dias para novos leads. WhatsApp + Email + Call de qualificação.',
    category: 'prospecção', status: 'active',
    steps: [
      { id: 's1', day: 0, channel: 'whatsapp', action: 'Mensagem de boas-vindas', template: 'welcome_pt',  duration_min: 2  },
      { id: 's2', day: 1, channel: 'email',    action: 'Email com case study',    template: 'case_study',  duration_min: 5  },
      { id: 's3', day: 2, channel: 'whatsapp', action: 'Follow-up com pergunta',  template: 'followup_q',  duration_min: 2  },
      { id: 's4', day: 3, channel: 'call',     action: 'Call de qualificação',                              duration_min: 15 },
      { id: 's5', day: 5, channel: 'email',    action: 'Email de proposta',       template: 'proposal',    duration_min: 5  },
    ],
    leads_enrolled: 142, completion_rate: 68, avg_close_rate: 24,
    duration_days: 5, author: 'Dex Silva', tags: ['facebook', 'google'], featured: true,
  },
  {
    id: 'pb2',
    name: 'Score Alto → Urgência',
    description: 'Para leads com score > 75. Sequência rápida de 48h para fechar enquanto estão quentes.',
    category: 'qualificação', status: 'active',
    steps: [
      { id: 's1', day: 0, channel: 'call',     action: 'Call imediata',           duration_min: 20 },
      { id: 's2', day: 0, channel: 'whatsapp', action: 'Proposta personalizada',  template: 'hot_lead', duration_min: 3  },
      { id: 's3', day: 1, channel: 'whatsapp', action: 'Confirmar interesse',     template: 'confirm',  duration_min: 2  },
      { id: 's4', day: 2, channel: 'meeting',  action: 'Reunião de fecho',         duration_min: 45 },
    ],
    leads_enrolled: 38, completion_rate: 82, avg_close_rate: 41,
    duration_days: 2, author: 'Quinn Costa', tags: ['hot'], featured: true,
  },
  {
    id: 'pb3',
    name: 'Reactivação 30 dias',
    description: 'Leads sem resposta há 30+ dias. Abordagem suave com nova proposta de valor.',
    category: 'reactivação', status: 'active',
    steps: [
      { id: 's1', day: 0, channel: 'email',    action: 'Email "Ainda a considerar?"', template: 'reactivation_email', duration_min: 3 },
      { id: 's2', day: 3, channel: 'whatsapp', action: 'WhatsApp informal',            template: 'reactivation_wa',   duration_min: 2 },
      { id: 's3', day: 7, channel: 'call',     action: 'Call de reactivação',          duration_min: 10 },
      { id: 's4', day: 7, channel: 'tag',      action: 'Tag: "reactivado"',            duration_min: 1  },
    ],
    leads_enrolled: 87, completion_rate: 45, avg_close_rate: 12,
    duration_days: 7, author: 'River Lopes', tags: ['cold', 'reactivação'], featured: false,
  },
  {
    id: 'pb4',
    name: 'Onboarding de Cliente',
    description: 'Para novos clientes. Garante uma transição perfeita e aumenta a retenção.',
    category: 'onboarding', status: 'active',
    steps: [
      { id: 's1', day: 0,  channel: 'whatsapp', action: 'Boas-vindas + link do portal', template: 'onboard_welcome', duration_min: 2  },
      { id: 's2', day: 1,  channel: 'meeting',  action: 'Kickoff meeting',               duration_min: 60 },
      { id: 's3', day: 3,  channel: 'email',    action: 'Checklist de integração',        template: 'onboard_check', duration_min: 3  },
      { id: 's4', day: 7,  channel: 'call',     action: 'Check-in de 1 semana',           duration_min: 15 },
      { id: 's5', day: 30, channel: 'email',    action: 'Relatório de 1º mês',            template: 'month_report', duration_min: 5  },
    ],
    leads_enrolled: 23, completion_rate: 91, avg_close_rate: 0,
    duration_days: 30, author: 'Dex Silva', tags: ['cliente', 'onboarding'], featured: false,
  },
  {
    id: 'pb5',
    name: 'Negociação Avançada',
    description: 'Para leads em fase de proposta. Técnicas de follow-up sem pressão.',
    category: 'negociação', status: 'draft',
    steps: [
      { id: 's1', day: 0, channel: 'email',    action: 'Enviar proposta detalhada', template: 'proposal_detail', duration_min: 5 },
      { id: 's2', day: 2, channel: 'whatsapp', action: 'Check-in de dúvidas',        template: 'doubts_check',   duration_min: 2 },
      { id: 's3', day: 4, channel: 'call',     action: 'Call de negociação',          duration_min: 30 },
      { id: 's4', day: 6, channel: 'email',    action: 'Prova social + urgência',     template: 'social_proof',  duration_min: 3 },
    ],
    leads_enrolled: 0, completion_rate: 0, avg_close_rate: 0,
    duration_days: 6, author: 'River Lopes', tags: ['negociação'], featured: false,
  },
]
