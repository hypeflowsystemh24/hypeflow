'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send } from 'lucide-react'

interface AiMsg {
  role: 'user' | 'assistant'
  content: string
}

interface ConvContext {
  name: string
  score: number
  temp: 'hot' | 'warm' | 'cold'
  channel: string
}

interface Props {
  conv: ConvContext | null
  onClose: () => void
}

const SUGGESTIONS = [
  'Redige uma mensagem de follow-up',
  'Qual o próximo passo com este lead?',
  'Analisa o score e perfil',
  'Sugere um playbook adequado',
]

export function AiPanel({ conv, onClose }: Props) {
  const [msgs, setMsgs]     = useState<AiMsg[]>([
    {
      role: 'assistant',
      content: conv
        ? `Olá! Estou a analisar a conversa com **${conv.name}** (score ${conv.score}, ${conv.temp === 'hot' ? '🔥 HOT' : conv.temp === 'warm' ? '🌡️ WARM' : '🔵 COLD'}).\n\nPosso ajudar a redigir mensagens, sugerir próximos passos ou analisar o perfil deste lead. O que precisa?`
        : 'Olá! Sou o HYPE AI. Seleccione uma conversa ou faça-me uma pergunta sobre os seus leads e pipeline.',
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: AiMsg = { role: 'user', content: input }
    setMsgs(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...msgs, userMsg],
          context: conv ? {
            lead_name:   conv.name,
            lead_score:  conv.score,
            lead_stage:  'Qualificação',
            lead_source: conv.channel,
          } : undefined,
        }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: data.content ?? 'Erro ao contactar o agente.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Sem ligação ao agente. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-80 flex-shrink-0 flex flex-col"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'var(--s0)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(209,255,0,0.12)' }}>
            <Bot size={14} style={{ color: '#D1FF00' }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>HYPE AI</p>
            <p className="text-[10px]" style={{ color: '#D1FF00' }}>Assistente contextual</p>
          </div>
        </div>
        <button onClick={onClose} className="tonal-hover p-1.5 rounded-lg" style={{ color: 'var(--t3)' }}>
          <X size={13} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
              style={m.role === 'user'
                ? { background: 'var(--cyan)', color: '#0D1117' }
                : { background: 'var(--s1)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl text-xs" style={{ background: 'var(--s1)', color: 'var(--t3)' }}>
              <span className="animate-pulse">A pensar...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown only before first user message) */}
      {msgs.length <= 1 && (
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="text-left text-[10px] px-2.5 py-1.5 rounded-xl tonal-hover transition-all"
              style={{ background: 'var(--s1)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Pergunta ao HYPE AI..."
            className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: 'var(--s1)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: input.trim() ? '#D1FF00' : 'var(--s1)', color: input.trim() ? '#0D1117' : 'var(--t3)' }}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
