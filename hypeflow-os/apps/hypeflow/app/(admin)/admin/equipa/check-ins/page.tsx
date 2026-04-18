'use client'

import { useState } from 'react'
import {
  ClipboardList, Plus, Send, Clock, CheckCircle, AlertTriangle,
  Settings, ChevronRight, X, Edit2, Trash2, Bell, Download,
  Users, BarChart2,
} from 'lucide-react'

/* ─── Types ─── */
interface CheckInQuestion {
  id: string
  text: string
  order: number
}

interface CheckInConfig {
  id: string
  name: string
  questions: CheckInQuestion[]
  schedule_time: string   // HH:MM
  schedule_days: number[] // 0=Sun … 6=Sat
  channel: 'in_app' | 'whatsapp'
  members: string[]
  active: boolean
}

interface CheckInResponse {
  id: string
  member_id: string
  member_name: string
  member_avatar: string
  config_id: string
  submitted_at: string
  answers: { question_id: string; text: string; answer: string }[]
}

/* ─── Default questions ─── */
const DEFAULT_QUESTIONS: CheckInQuestion[] = [
  { id: 'q1', text: 'Que calls realizaste hoje?',                         order: 1 },
  { id: 'q2', text: 'Qual o deal mais próximo de fechar e o que falta?',  order: 2 },
  { id: 'q3', text: 'O que está a bloquear o teu pipeline?',              order: 3 },
  { id: 'q4', text: 'Quantos novos leads contactaste hoje?',               order: 4 },
  { id: 'q5', text: 'Qual o teu score médio de leads activos?',            order: 5 },
]

const MOCK_MEMBERS = [
  { id: 'u1', name: 'João Ferreira',  avatar: 'J', role: 'Closer' },
  { id: 'u2', name: 'Ana Costa',      avatar: 'A', role: 'Closer' },
  { id: 'u3', name: 'Miguel Santos',  avatar: 'M', role: 'SDR' },
  { id: 'u4', name: 'Sofia Lima',     avatar: 'S', role: 'SDR' },
]

const MOCK_CONFIG: CheckInConfig = {
  id: 'ci1',
  name: 'Check-in Diário da Equipa',
  questions: DEFAULT_QUESTIONS,
  schedule_time: '18:00',
  schedule_days: [1, 2, 3, 4, 5],
  channel: 'in_app',
  members: ['u1', 'u2', 'u3', 'u4'],
  active: true,
}

const MOCK_RESPONSES: CheckInResponse[] = [
  {
    id: 'r1', member_id: 'u1', member_name: 'João Ferreira', member_avatar: 'J', config_id: 'ci1',
    submitted_at: new Date(Date.now() - 1800000).toISOString(),
    answers: [
      { question_id: 'q1', text: 'Que calls realizaste hoje?',    answer: '6 calls, 4 atendidas' },
      { question_id: 'q2', text: 'Deal mais próximo de fechar?',  answer: 'TechnoSpark — falta apenas assinatura do contrato' },
      { question_id: 'q3', text: 'O que está a bloquear?',        answer: 'Nada de bloqueante hoje' },
      { question_id: 'q4', text: 'Novos leads contactados?',      answer: '8 leads novos via WhatsApp' },
      { question_id: 'q5', text: 'Score médio activos?',          answer: '74 pontos' },
    ],
  },
  {
    id: 'r2', member_id: 'u2', member_name: 'Ana Costa', member_avatar: 'A', config_id: 'ci1',
    submitted_at: new Date(Date.now() - 3600000).toISOString(),
    answers: [
      { question_id: 'q1', text: 'Que calls realizaste hoje?',    answer: '4 calls, todas atendidas' },
      { question_id: 'q2', text: 'Deal mais próximo de fechar?',  answer: 'Clínica Horizonte — aguardo resposta ao email com proposta' },
      { question_id: 'q3', text: 'O que está a bloquear?',        answer: 'Lead FitMax precisa de aprovação interna deles' },
      { question_id: 'q4', text: 'Novos leads contactados?',      answer: '5 leads novos' },
      { question_id: 'q5', text: 'Score médio activos?',          answer: '69 pontos' },
    ],
  },
  {
    id: 'r3', member_id: 'u3', member_name: 'Miguel Santos', member_avatar: 'M', config_id: 'ci1',
    submitted_at: new Date(Date.now() - 7200000).toISOString(),
    answers: [
      { question_id: 'q1', text: 'Que calls realizaste hoje?',    answer: '2 calls, 1 atendida' },
      { question_id: 'q2', text: 'Deal mais próximo de fechar?',  answer: 'AutoGroup — ainda em qualificação' },
      { question_id: 'q3', text: 'O que está a bloquear?',        answer: 'Dificuldade em marcar calls com decisores' },
      { question_id: 'q4', text: 'Novos leads contactados?',      answer: '3 leads' },
      { question_id: 'q5', text: 'Score médio activos?',          answer: '58 pontos' },
    ],
  },
]

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/* ─── Config panel ─── */
function ConfigPanel({
  config,
  onClose,
}: {
  config: CheckInConfig
  onClose: () => void
}) {
  const [questions, setQuestions] = useState(config.questions)
  const [time, setTime]           = useState(config.schedule_time)
  const [days, setDays]           = useState(config.schedule_days)
  const [channel, setChannel]     = useState(config.channel)
  const [newQ, setNewQ]           = useState('')
  const [saved, setSaved]         = useState(false)

  const addQ = () => {
    if (!newQ.trim()) return
    setQuestions(prev => [...prev, { id: `q${Date.now()}`, text: newQ.trim(), order: prev.length + 1 }])
    setNewQ('')
  }
  const removeQ = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id))
  const toggleDay = (d: number) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const save = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-float)', maxHeight: '90vh' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Settings size={16} style={{ color: 'var(--cyan)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>Configurar Check-in</p>
          </div>
          <button onClick={onClose} className="tonal-hover p-1.5 rounded-lg" style={{ color: 'var(--t3)' }}><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Schedule */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>Horário de envio</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>

          {/* Days */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>Dias da semana</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background: days.includes(i) ? 'rgba(33,160,196,0.15)' : 'var(--s2)',
                    color: days.includes(i) ? 'var(--cyan)' : 'var(--t3)',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>Canal</label>
            <div className="flex gap-2">
              {(['in_app', 'whatsapp'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: channel === c ? 'rgba(33,160,196,0.15)' : 'var(--s2)',
                    color: channel === c ? 'var(--cyan)' : 'var(--t3)',
                  }}
                >
                  {c === 'in_app' ? '🔔 Notificação' : '💬 WhatsApp'}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>Perguntas ({questions.length})</label>
            <div className="flex flex-col gap-1.5 mb-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--s2)' }}>
                  <span className="text-[10px] font-bold w-4 flex-shrink-0" style={{ color: 'var(--t3)' }}>{i + 1}</span>
                  <p className="flex-1 text-xs" style={{ color: 'var(--t2)' }}>{q.text}</p>
                  <button onClick={() => removeQ(q.id)} className="tonal-hover p-1 rounded-lg" style={{ color: 'var(--t3)' }}><Trash2 size={11} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newQ}
                onChange={e => setNewQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addQ()}
                placeholder="Adicionar pergunta..."
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <button onClick={addQ} className="p-2 rounded-xl tonal-hover" style={{ background: 'var(--s2)', color: 'var(--cyan)' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={save}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all btn-lime"
          >
            {saved ? <><CheckCircle size={14} /> Guardado!</> : <><Send size={14} /> Guardar configuração</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function CheckInsPage() {
  const [showConfig, setShowConfig] = useState(false)
  const [config] = useState<CheckInConfig>(MOCK_CONFIG)
  const [responses] = useState<CheckInResponse[]>(MOCK_RESPONSES)
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null)

  const respondedIds   = responses.map(r => r.member_id)
  const pendingMembers = config.members
    .filter(id => !respondedIds.includes(id))
    .map(id => MOCK_MEMBERS.find(m => m.id === id))
    .filter(Boolean)

  const responseRate = Math.round((respondedIds.length / config.members.length) * 100)

  const exportCsv = () => {
    const rows = responses.flatMap(r =>
      r.answers.map(a => [r.member_name, r.submitted_at.slice(0, 10), a.text, a.answer])
    )
    const csv = [['Membro', 'Data', 'Pergunta', 'Resposta'], ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'check-ins.csv'; a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      {showConfig && <ConfigPanel config={config} onClose={() => setShowConfig(false)} />}

      <div className="flex flex-col gap-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="tag-label mb-1">EQUIPA · CHECK-INS</p>
            <h1 className="page-title">Standups Assíncronos</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--t2)' }}>
              Enviado todos os dias úteis às {config.schedule_time} · {config.members.length} membros
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl tonal-hover" style={{ background: 'var(--s1)', color: 'var(--t2)' }}>
              <Download size={13} /> Exportar CSV
            </button>
            <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl tonal-hover" style={{ background: 'var(--s1)', color: 'var(--t2)' }}>
              <Settings size={13} /> Configurar
            </button>
            <button className="btn-lime flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
              <Send size={14} /> Enviar agora
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Taxa de resposta', value: `${responseRate}%`, icon: BarChart2,     color: responseRate >= 85 ? 'var(--success)' : '#F5A623' },
            { label: 'Responderam hoje', value: `${responses.length}/${config.members.length}`, icon: CheckCircle, color: 'var(--cyan)' },
            { label: 'Por responder',    value: String(pendingMembers.length), icon: Clock, color: pendingMembers.length > 0 ? '#F5A623' : 'var(--t3)' },
            { label: 'Dias activos',     value: `${config.schedule_days.length}/7`, icon: ClipboardList, color: 'var(--t2)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending alert */}
        {pendingMembers.length > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <AlertTriangle size={16} style={{ color: '#F5A623', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#F5A623' }}>Sem resposta há mais de 2h</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>
                {pendingMembers.map(m => m?.name).join(', ')}
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
              <Bell size={11} /> Notificar
            </button>
          </div>
        )}

        {/* Response feed */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>Respostas de hoje · {new Date().toLocaleDateString('pt-PT')}</p>

          {responses.map(r => {
            const isExpanded = expandedResponse === r.id
            const minutesAgo = Math.round((Date.now() - new Date(r.submitted_at).getTime()) / 60000)
            const timeLabel  = minutesAgo < 60 ? `${minutesAgo}m atrás` : `${Math.round(minutesAgo / 60)}h atrás`

            return (
              <div key={r.id} className="rounded-2xl overflow-hidden card transition-all">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpandedResponse(isExpanded ? null : r.id)}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--s3)', color: 'var(--t2)' }}>
                    {r.member_avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{r.member_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>
                      {r.answers[0]?.answer ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{timeLabel}</span>
                    <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                    <ChevronRight
                      size={14}
                      style={{ color: 'var(--t3)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 flex flex-col gap-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {r.answers.map(a => (
                      <div key={a.question_id} className="flex flex-col gap-1 pt-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>{a.text}</p>
                        <p className="text-sm" style={{ color: 'var(--t2)' }}>{a.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Pending members */}
          {pendingMembers.map(m => m && (
            <div key={m.id} className="flex items-center gap-3 p-4 rounded-2xl opacity-50" style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'var(--s3)', color: 'var(--t3)' }}>
                {m.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>{m.name}</p>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>Sem resposta</p>
              </div>
              <Clock size={13} style={{ color: '#F5A623' }} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
