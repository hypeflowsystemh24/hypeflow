'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Search, Filter, Send, Paperclip, Smile,
  Phone, Video, MoreVertical, ChevronDown,
  MessageSquare, Mail, Instagram, Facebook,
  Smartphone, Globe, Star, Clock, CheckCheck, Check,
  ArrowLeft, Plus, X, Bot, Zap,
} from 'lucide-react'

/* ─── Types ─── */
type Channel = 'whatsapp' | 'email' | 'instagram' | 'facebook' | 'sms' | 'chat'
type Status = 'open' | 'pending' | 'closed'

interface Conversation {
  id: string
  name: string
  avatar: string
  channel: Channel
  status: Status
  lastMessage: string
  lastTime: string
  unread: number
  score: number
  temp: 'hot' | 'warm' | 'cold'
  assignee?: string
  tags: string[]
  messages: Message[]
}

interface Message {
  id: string
  from: 'contact' | 'agent'
  text: string
  time: string
  channel: Channel
  read: boolean
}

/* ─── Mock Data ─── */
const CHANNEL_ICONS: Record<Channel, React.ElementType> = {
  whatsapp: Smartphone,
  email: Mail,
  instagram: Instagram,
  facebook: Facebook,
  sms: MessageSquare,
  chat: Globe,
}

const CHANNEL_COLORS: Record<Channel, string> = {
  whatsapp: '#25D366',
  email: '#EA4335',
  instagram: '#E1306C',
  facebook: '#1877F2',
  sms: '#F5A623',
  chat: '#21A0C4',
}

const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  instagram: 'Instagram',
  facebook: 'Facebook',
  sms: 'SMS',
  chat: 'Live Chat',
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Tiago Fonseca',
    avatar: 'TF',
    channel: 'whatsapp',
    status: 'open',
    lastMessage: 'Olá, tenho interesse no vosso serviço de marketing digital...',
    lastTime: '2m',
    unread: 3,
    score: 87,
    temp: 'hot',
    assignee: 'Ana',
    tags: ['lead-quente', 'marketing'],
    messages: [
      { id: 'm1', from: 'contact', text: 'Olá! Vi o vosso anúncio no Instagram e tenho interesse.', time: '09:14', channel: 'whatsapp', read: true },
      { id: 'm2', from: 'agent', text: 'Bom dia Tiago! Obrigado pelo interesse. O que é que está à procura exactamente?', time: '09:16', channel: 'whatsapp', read: true },
      { id: 'm3', from: 'contact', text: 'Quero aumentar as vendas da minha loja online. Trabalham com e-commerce?', time: '09:18', channel: 'whatsapp', read: true },
      { id: 'm4', from: 'contact', text: 'Olá, tenho interesse no vosso serviço de marketing digital...', time: '09:42', channel: 'whatsapp', read: false },
    ],
  },
  {
    id: '2',
    name: 'Ana Ferreira',
    avatar: 'AF',
    channel: 'email',
    status: 'pending',
    lastMessage: 'Aguardo proposta até sexta-feira.',
    lastTime: '15m',
    unread: 1,
    score: 72,
    temp: 'warm',
    assignee: 'Carlos',
    tags: ['proposta', 'b2b'],
    messages: [
      { id: 'm1', from: 'contact', text: 'Bom dia, estou interessada numa proposta para a minha empresa.', time: '08:00', channel: 'email', read: true },
      { id: 'm2', from: 'agent', text: 'Olá Ana! Claro. Pode partilhar mais detalhes sobre o que precisa?', time: '08:30', channel: 'email', read: true },
      { id: 'm3', from: 'contact', text: 'Aguardo proposta até sexta-feira.', time: '08:55', channel: 'email', read: false },
    ],
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    avatar: 'CM',
    channel: 'instagram',
    status: 'open',
    lastMessage: 'Que horas é a call amanhã?',
    lastTime: '1h',
    unread: 2,
    score: 91,
    temp: 'hot',
    assignee: 'Ana',
    tags: ['call-agendada'],
    messages: [
      { id: 'm1', from: 'contact', text: 'Oi! Vi o vosso perfil e adorei o trabalho!', time: '07:00', channel: 'instagram', read: true },
      { id: 'm2', from: 'agent', text: 'Obrigado Carlos! Podemos marcar uma call?', time: '07:15', channel: 'instagram', read: true },
      { id: 'm3', from: 'contact', text: 'Que horas é a call amanhã?', time: '08:00', channel: 'instagram', read: false },
    ],
  },
  {
    id: '4',
    name: 'Sofia Lopes',
    avatar: 'SL',
    channel: 'whatsapp',
    status: 'open',
    lastMessage: 'Ok, vejo o relatório e digo-lhe.',
    lastTime: '2h',
    unread: 0,
    score: 65,
    temp: 'warm',
    tags: ['follow-up'],
    messages: [
      { id: 'm1', from: 'agent', text: 'Bom dia Sofia! Como correu a semana?', time: '10:00', channel: 'whatsapp', read: true },
      { id: 'm2', from: 'contact', text: 'Ok, vejo o relatório e digo-lhe.', time: '10:05', channel: 'whatsapp', read: true },
    ],
  },
  {
    id: '5',
    name: 'Miguel Costa',
    avatar: 'MC',
    channel: 'facebook',
    status: 'closed',
    lastMessage: 'Muito obrigado pelo acompanhamento!',
    lastTime: '1d',
    unread: 0,
    score: 44,
    temp: 'cold',
    tags: [],
    messages: [
      { id: 'm1', from: 'contact', text: 'Muito obrigado pelo acompanhamento!', time: '14:00', channel: 'facebook', read: true },
    ],
  },
  {
    id: '6',
    name: 'Rita Alves',
    avatar: 'RA',
    channel: 'sms',
    status: 'open',
    lastMessage: 'Quando é que posso receber mais info?',
    lastTime: '3h',
    unread: 1,
    score: 78,
    temp: 'warm',
    tags: ['info-request'],
    messages: [
      { id: 'm1', from: 'contact', text: 'Olá! Recebi o SMS. Quando é que posso receber mais info?', time: '11:30', channel: 'sms', read: false },
    ],
  },
]

const QUICK_REPLIES = [
  'Olá! Obrigado pelo contacto. Como posso ajudar?',
  'Claro! Posso agendar uma call consigo para melhor explicar?',
  'Vou verificar e retorno em breve.',
  'Que data e hora seria melhor para si?',
]

const tempColor: Record<string, string> = { cold: '#4A6680', warm: '#F5A623', hot: '#E84545' }

/* ─── Channel Filter Tab ─── */
function ChannelTab({ channel, active, count, onClick }: { channel: Channel | 'all'; active: boolean; count: number; onClick: () => void }) {
  const Icon = channel === 'all' ? MessageSquare : CHANNEL_ICONS[channel as Channel]
  const color = channel === 'all' ? 'var(--cyan)' : CHANNEL_COLORS[channel as Channel]
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
      style={{
        background: active ? `${color}18` : 'transparent',
        color: active ? color : 'var(--t3)',
        border: active ? `1px solid ${color}30` : '1px solid transparent',
      }}
    >
      <Icon size={12} />
      {channel === 'all' ? 'Todos' : CHANNEL_LABELS[channel as Channel]}
      {count > 0 && (
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: color, color: '#000' }}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ─── Conversation Row ─── */
function ConvRow({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
  const Icon = CHANNEL_ICONS[conv.channel]
  const color = CHANNEL_COLORS[conv.channel]
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all"
      style={{
        background: active ? 'var(--s2)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
          {conv.avatar}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--s0)', border: '2px solid var(--s0)' }}>
          <Icon size={9} style={{ color }} />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className="text-sm font-semibold truncate" style={{ color: conv.unread > 0 ? 'var(--t1)' : 'var(--t2)' }}>{conv.name}</p>
          <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--t3)' }}>{conv.lastTime}</span>
        </div>
        <p className="text-xs truncate" style={{ color: conv.unread > 0 ? 'var(--t2)' : 'var(--t3)' }}>{conv.lastMessage}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${tempColor[conv.temp]}18`, color: tempColor[conv.temp] }}>
            {conv.temp.toUpperCase()}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--t3)' }}>{conv.score}</span>
          {conv.tags.slice(0, 1).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>#{t}</span>
          ))}
        </div>
      </div>
      {/* Unread badge */}
      {conv.unread > 0 && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: 'var(--cyan)', color: '#0D1117' }}>
          {conv.unread}
        </div>
      )}
    </div>
  )
}

/* ─── Message Bubble ─── */
function MessageBubble({ msg }: { msg: Message }) {
  const isAgent = msg.from === 'agent'
  const Icon = CHANNEL_ICONS[msg.channel]
  const color = CHANNEL_COLORS[msg.channel]
  return (
    <div className={`flex gap-2.5 ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isAgent && (
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-auto" style={{ background: `${color}18` }}>
          <Icon size={12} style={{ color }} />
        </div>
      )}
      <div style={{ maxWidth: '72%' }}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isAgent ? 'var(--cyan)' : 'var(--s2)',
            color: isAgent ? '#0D1117' : 'var(--t1)',
            borderBottomRightRadius: isAgent ? '4px' : '16px',
            borderBottomLeftRadius: isAgent ? '16px' : '4px',
          }}
        >
          {msg.text}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isAgent ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[11px]" style={{ color: 'var(--t3)' }}>{msg.time}</span>
          {isAgent && (
            msg.read
              ? <CheckCheck size={11} style={{ color: 'var(--cyan)' }} />
              : <Check size={11} style={{ color: 'var(--t3)' }} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function ConversasPage() {
  const [activeChannel, setActiveChannel] = useState<Channel | 'all'>('all')
  const [activeConv, setActiveConv] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]!)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv])

  const filtered = MOCK_CONVERSATIONS.filter(c => {
    if (activeChannel !== 'all' && c.channel !== activeChannel) return false
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const channelCounts: Partial<Record<Channel | 'all', number>> = { all: MOCK_CONVERSATIONS.filter(c => c.unread > 0).length }
  MOCK_CONVERSATIONS.forEach(c => {
    if (c.unread > 0) channelCounts[c.channel] = (channelCounts[c.channel] ?? 0) + c.unread
  })

  function sendMessage() {
    if (!message.trim() || !activeConv) return
    setMessage('')
    setShowQuickReplies(false)
  }

  return (
    <div className="flex h-full -m-6 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Left Panel: Conversation List ── */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'var(--s0)' }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-display font-bold text-lg" style={{ color: 'var(--t1)' }}>Conversas</h1>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
              <Plus size={12} /> Nova
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
            />
          </div>

          {/* Channel filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(['all', 'whatsapp', 'email', 'instagram', 'facebook', 'sms'] as const).map(ch => (
              <ChannelTab
                key={ch}
                channel={ch}
                active={activeChannel === ch}
                count={channelCounts[ch] ?? 0}
                onClick={() => setActiveChannel(ch)}
              />
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 mt-2">
            {(['all', 'open', 'pending', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: statusFilter === s ? 'var(--s2)' : 'transparent',
                  color: statusFilter === s ? 'var(--t1)' : 'var(--t3)',
                }}
              >
                {s === 'all' ? 'Todos' : s === 'open' ? 'Abertos' : s === 'pending' ? 'Pendentes' : 'Fechados'}
              </button>
            ))}
          </div>
        </div>

        {/* Conv list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <ConvRow
              key={conv.id}
              conv={conv}
              active={activeConv?.id === conv.id}
              onClick={() => setActiveConv(conv)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32">
              <MessageSquare size={24} style={{ color: 'var(--t3)' }} />
              <p className="text-sm mt-2" style={{ color: 'var(--t3)' }}>Nenhuma conversa</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main: Chat Area ── */}
      {activeConv ? (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--s0)' }}>

          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                  {activeConv.avatar}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--s0)' }}
                >
                  {(() => {
                    const Icon = CHANNEL_ICONS[activeConv.channel]
                    return <Icon size={9} style={{ color: CHANNEL_COLORS[activeConv.channel] }} />
                  })()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>{activeConv.name}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${tempColor[activeConv.temp]}18`, color: tempColor[activeConv.temp] }}>
                    {activeConv.temp.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>
                    Score {activeConv.score}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>
                  {CHANNEL_LABELS[activeConv.channel]} · {activeConv.status === 'open' ? 'Aberto' : activeConv.status === 'pending' ? 'Pendente' : 'Fechado'}
                  {activeConv.assignee && ` · ${activeConv.assignee}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl tonal-hover" style={{ color: 'var(--t2)' }}>
                <Phone size={15} />
              </button>
              <button className="p-2 rounded-xl tonal-hover" style={{ color: 'var(--t2)' }}>
                <Video size={15} />
              </button>
              <button className="p-2 rounded-xl tonal-hover" style={{ color: 'var(--t2)' }}>
                <Star size={15} />
              </button>
              <button className="p-2 rounded-xl tonal-hover" style={{ color: 'var(--t2)' }}>
                <MoreVertical size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {activeConv.messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && (
            <div className="px-5 pb-2">
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'var(--s2)' }}>
                {QUICK_REPLIES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { setMessage(r); setShowQuickReplies(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm tonal-hover"
                    style={{ color: 'var(--t2)', borderBottom: i < QUICK_REPLIES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="px-5 pb-4 pt-2 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Channel selector */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-xs" style={{ color: 'var(--t3)' }}>Via</span>
                {(['whatsapp', 'email', 'instagram'] as Channel[]).map(ch => {
                  const Icon = CHANNEL_ICONS[ch]
                  const color = CHANNEL_COLORS[ch]
                  return (
                    <button key={ch} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all" style={{ background: `${color}18`, color }}>
                      <Icon size={10} /> {CHANNEL_LABELS[ch]}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Escreva uma mensagem..."
                rows={2}
                className="w-full px-4 py-3 text-sm outline-none resize-none"
                style={{ background: 'transparent', color: 'var(--t1)' }}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}>
                    <Paperclip size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}>
                    <Smile size={14} />
                  </button>
                  <button
                    onClick={() => setShowQuickReplies(q => !q)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: showQuickReplies ? 'rgba(33,160,196,0.15)' : 'var(--s3)', color: showQuickReplies ? 'var(--cyan)' : 'var(--t3)' }}
                  >
                    <Zap size={12} /> Respostas
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs" style={{ background: 'var(--s3)', color: 'var(--t3)' }}>
                    <Bot size={12} /> IA
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: message.trim() ? 'var(--cyan)' : 'var(--s3)',
                    color: message.trim() ? '#0D1117' : 'var(--t3)',
                  }}
                >
                  <Send size={13} /> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={40} style={{ color: 'var(--t3)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--t3)' }}>Selecione uma conversa</p>
          </div>
        </div>
      )}

      {/* ── Right Panel: Contact Info ── */}
      {activeConv && (
        <div className="w-64 flex-shrink-0 flex flex-col border-l p-4 gap-4 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'var(--s0)' }}>
          <div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-2" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
              {activeConv.avatar}
            </div>
            <p className="text-sm font-semibold text-center mb-0.5" style={{ color: 'var(--t1)' }}>{activeConv.name}</p>
            <p className="text-xs text-center" style={{ color: 'var(--t3)' }}>Score: {activeConv.score}</p>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t3)' }}>Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {activeConv.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>#{t}</span>
              ))}
              <button className="text-xs px-2 py-0.5 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>+ Tag</button>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t3)' }}>Responsável</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--s2)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(33,160,196,0.15)', color: 'var(--cyan)' }}>
                {activeConv.assignee ? activeConv.assignee.slice(0, 1) : '?'}
              </div>
              <span className="text-sm" style={{ color: 'var(--t2)' }}>{activeConv.assignee ?? 'Não atribuído'}</span>
            </div>
          </div>

          {/* Stage */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t3)' }}>Pipeline</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--s2)' }}>
              <span className="text-sm" style={{ color: 'var(--t2)' }}>Qualificando</span>
              <ChevronDown size={12} style={{ color: 'var(--t3)', marginLeft: 'auto' }} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-2">
            <button className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--cyan)', color: '#0D1117' }}>
              Ver Perfil CRM
            </button>
            <button className="w-full py-2 rounded-xl text-sm" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
              Agendar Call
            </button>
            <button className="w-full py-2 rounded-xl text-sm" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
              Criar Tarefa
            </button>
          </div>

          {/* History */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--t3)' }}>Histórico</p>
            {[
              { icon: Phone, text: 'Call realizada', time: '2d' },
              { icon: Mail, text: 'Email enviado', time: '4d' },
              { icon: Clock, text: 'Lead criada', time: '1sem' },
            ].map(({ icon: Icon, text, time }, i) => (
              <div key={i} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <Icon size={11} style={{ color: 'var(--t3)' }} />
                <span className="text-xs flex-1" style={{ color: 'var(--t2)' }}>{text}</span>
                <span className="text-[11px]" style={{ color: 'var(--t3)' }}>{time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
