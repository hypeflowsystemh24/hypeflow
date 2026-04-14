'use client'

import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Clock, Video,
  Phone, MapPin, Users, Calendar, CheckCircle2,
  XCircle, AlertCircle, MoreVertical, Copy, Trash2,
  Link2, Bell, User,
} from 'lucide-react'

/* ─── Types ─── */
type EventType = 'call' | 'meeting' | 'task' | 'followup'
type EventStatus = 'scheduled' | 'done' | 'cancelled' | 'noshow'

interface CalEvent {
  id: string
  title: string
  contact: string
  type: EventType
  status: EventStatus
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // minutes
  notes?: string
  meet?: string
  assignee: string
  score?: number
}

/* ─── Mock data ─── */
const TODAY = new Date()
const toISO = (d: Date) => d.toISOString().split('T')[0]!

const addDays = (d: Date, n: number) => {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

const MOCK_EVENTS: CalEvent[] = [
  { id: '1', title: 'Discovery Call', contact: 'Tiago Fonseca', type: 'call', status: 'scheduled', date: toISO(TODAY), time: '10:00', duration: 30, meet: 'https://meet.google.com/abc', assignee: 'Ana', score: 87 },
  { id: '2', title: 'Apresentação Proposta', contact: 'Ana Ferreira', type: 'meeting', status: 'scheduled', date: toISO(TODAY), time: '11:30', duration: 60, meet: 'https://meet.google.com/def', assignee: 'Carlos', score: 72 },
  { id: '3', title: 'Follow-up Proposta', contact: 'Carlos Mendes', type: 'followup', status: 'done', date: toISO(TODAY), time: '14:00', duration: 30, assignee: 'Ana', score: 91 },
  { id: '4', title: 'Call de Fecho', contact: 'Sofia Lopes', type: 'call', status: 'scheduled', date: toISO(TODAY), time: '16:00', duration: 45, assignee: 'Ana', score: 65 },
  { id: '5', title: 'Reunião Estratégica', contact: 'João Santos', type: 'meeting', status: 'scheduled', date: toISO(addDays(TODAY, 1)), time: '09:30', duration: 90, meet: 'https://meet.google.com/ghi', assignee: 'Carlos', score: 83 },
  { id: '6', title: 'Discovery Call', contact: 'Rita Alves', type: 'call', status: 'scheduled', date: toISO(addDays(TODAY, 1)), time: '14:00', duration: 30, assignee: 'Ana', score: 78 },
  { id: '7', title: 'No-show follow-up', contact: 'Miguel Costa', type: 'followup', status: 'noshow', date: toISO(addDays(TODAY, -1)), time: '11:00', duration: 30, assignee: 'Carlos', score: 44 },
  { id: '8', title: 'Proposta Detalhada', contact: 'Marta Rodrigues', type: 'meeting', status: 'cancelled', date: toISO(addDays(TODAY, -1)), time: '15:00', duration: 60, assignee: 'Ana', score: 58 },
  { id: '9', title: 'Upsell Call', contact: 'Carlos Mendes', type: 'call', status: 'scheduled', date: toISO(addDays(TODAY, 3)), time: '10:00', duration: 45, assignee: 'Ana', score: 91 },
  { id: '10', title: 'Discovery Call', contact: 'Pedro Neves', type: 'call', status: 'scheduled', date: toISO(addDays(TODAY, 3)), time: '14:30', duration: 30, assignee: 'Carlos', score: 69 },
]

const TYPE_COLORS: Record<EventType, string> = {
  call: '#21A0C4',
  meeting: '#D1FF00',
  task: '#F5A623',
  followup: '#E84545',
}

const TYPE_LABELS: Record<EventType, string> = {
  call: 'Call',
  meeting: 'Reunião',
  task: 'Tarefa',
  followup: 'Follow-up',
}

const STATUS_ICONS: Record<EventStatus, React.ElementType> = {
  scheduled: Clock,
  done: CheckCircle2,
  cancelled: XCircle,
  noshow: AlertCircle,
}

const STATUS_COLORS: Record<EventStatus, string> = {
  scheduled: 'var(--cyan)',
  done: 'var(--success)',
  cancelled: 'var(--t3)',
  noshow: '#F5A623',
}

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

/* ─── Event Card ─── */
function EventCard({ event, onClick }: { event: CalEvent; onClick: () => void }) {
  const StatusIcon = STATUS_ICONS[event.status]
  const isPast = event.status === 'done' || event.status === 'cancelled' || event.status === 'noshow'
  return (
    <div
      onClick={onClick}
      className="px-3 py-2.5 rounded-xl cursor-pointer transition-all tonal-hover"
      style={{
        background: `${TYPE_COLORS[event.type]}12`,
        border: `1px solid ${TYPE_COLORS[event.type]}25`,
        opacity: isPast ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${TYPE_COLORS[event.type]}20`, color: TYPE_COLORS[event.type] }}>
              {TYPE_LABELS[event.type]}
            </span>
            <span className="text-xs" style={{ color: 'var(--t3)' }}>{event.time} · {event.duration}min</span>
          </div>
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{event.title}</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>{event.contact}</p>
        </div>
        <StatusIcon size={14} style={{ color: STATUS_COLORS[event.status], flexShrink: 0, marginTop: 2 }} />
      </div>
      {event.meet && event.status === 'scheduled' && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--cyan)' }}>
          <Video size={11} /> Meet link
        </div>
      )}
    </div>
  )
}

/* ─── Day Column ─── */
function DayColumn({ date, events, selectedEvent, onEventClick }: {
  date: Date
  events: CalEvent[]
  selectedEvent: CalEvent | null
  onEventClick: (e: CalEvent) => void
}) {
  const iso = toISO(date)
  const isToday = iso === toISO(TODAY)
  const dayEvents = events.filter(e => e.date === iso)

  return (
    <div className="flex-1 min-w-0">
      {/* Day header */}
      <div className="text-center pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--t3)' }}>
          {date.toLocaleDateString('pt-PT', { weekday: 'short' })}
        </p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold mx-auto"
          style={{
            background: isToday ? 'var(--cyan)' : 'transparent',
            color: isToday ? '#0D1117' : 'var(--t1)',
          }}
        >
          {date.getDate()}
        </div>
        {dayEvents.length > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{dayEvents.length} eventos</p>
        )}
      </div>

      {/* Events */}
      <div className="py-2 flex flex-col gap-2 px-1">
        {HOURS.map(h => {
          const eventsAtHour = dayEvents.filter(e => e.time.startsWith(h.slice(0, 2)))
          return (
            <div key={h} className="relative" style={{ minHeight: '40px' }}>
              <span className="absolute -left-8 top-0 text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>{h}</span>
              <div className="flex flex-col gap-1">
                {eventsAtHour.map(event => (
                  <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Event Detail Modal ─── */
function EventDetail({ event, onClose }: { event: CalEvent; onClose: () => void }) {
  const StatusIcon = STATUS_ICONS[event.status]
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${TYPE_COLORS[event.type]}18`, color: TYPE_COLORS[event.type] }}>
              {TYPE_LABELS[event.type]}
            </span>
            <StatusIcon size={13} style={{ color: STATUS_COLORS[event.status] }} />
            <span className="text-xs" style={{ color: STATUS_COLORS[event.status] }}>
              {event.status === 'scheduled' ? 'Agendado' : event.status === 'done' ? 'Realizado' : event.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
            </span>
          </div>
          <p className="font-bold" style={{ color: 'var(--t1)' }}>{event.title}</p>
        </div>
        <button onClick={onClose} style={{ color: 'var(--t3)' }}><XCircle size={16} /></button>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { icon: User, label: event.contact + (event.score ? ` · Score ${event.score}` : '') },
          { icon: Calendar, label: new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }) },
          { icon: Clock, label: `${event.time} · ${event.duration} minutos` },
          { icon: Users, label: event.assignee },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={13} style={{ color: 'var(--t3)' }} />
            <span className="text-sm" style={{ color: 'var(--t2)' }}>{label}</span>
          </div>
        ))}
        {event.meet && (
          <div className="flex items-center gap-2.5">
            <Video size={13} style={{ color: 'var(--cyan)' }} />
            <a href={event.meet} target="_blank" rel="noreferrer" className="text-sm" style={{ color: 'var(--cyan)' }}>
              Entrar na reunião
            </a>
          </div>
        )}
      </div>

      {event.status === 'scheduled' && (
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--cyan)', color: '#0D1117' }}>
            {event.meet ? '↗ Entrar' : <><Phone size={13} className="inline mr-1" />Ligar</>}
          </button>
          <button className="flex-1 py-2 rounded-xl text-sm" style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={13} className="inline mr-1" />Feito
          </button>
          <button className="flex-1 py-2 rounded-xl text-sm" style={{ background: 'rgba(232,69,69,0.1)', color: 'var(--danger)' }}>
            <XCircle size={13} className="inline mr-1" />Cancelar
          </button>
        </div>
      )}

      {event.status === 'noshow' && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#F5A623' }}>No-Show detectado</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>Automação de reactivação enviada</p>
          <button className="text-xs mt-2 font-semibold" style={{ color: '#F5A623' }}>Reagendar →</button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--t3)' }}><Copy size={11} /> Copiar link</button>
        <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--t3)' }}><Bell size={11} /> Lembrete</button>
        <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--danger)' }}><Trash2 size={11} /> Apagar</button>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function CalendarioPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null)
  const [view, setView] = useState<'week' | 'day' | 'list'>('week')

  const weekStart = addDays(TODAY, weekOffset * 7 - TODAY.getDay() + 1)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  const todayEvents = MOCK_EVENTS.filter(e => e.date === toISO(TODAY)).sort((a, b) => a.time.localeCompare(b.time))
  const upcomingEvents = MOCK_EVENTS.filter(e => e.date > toISO(TODAY) && e.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const stats = {
    today: todayEvents.filter(e => e.status === 'scheduled').length,
    done: todayEvents.filter(e => e.status === 'done').length,
    noshow: MOCK_EVENTS.filter(e => e.status === 'noshow').length,
    upcoming: upcomingEvents.length,
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Calendário</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Agenda de calls e reuniões</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Booking link */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
            <Link2 size={13} /> Link de Agendamento
          </button>
          <button className="btn-lime flex items-center gap-2 px-5 py-2.5 rounded-xl">
            <Plus size={15} /> Nova Call
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Calls Hoje', value: stats.today, color: 'var(--cyan)', sub: 'agendadas' },
          { label: 'Realizadas', value: stats.done, color: 'var(--success)', sub: 'hoje' },
          { label: 'No-shows', value: stats.noshow, color: '#F5A623', sub: 'esta semana' },
          { label: 'Próximas', value: stats.upcoming, color: '#D1FF00', sub: '7 dias' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg font-display flex-shrink-0" style={{ background: `${color}15`, color }}>
              {value}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="col-span-2 card p-5 flex flex-col gap-4">
          {/* Calendar nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t2)' }}>
                <ChevronLeft size={16} />
              </button>
              <p className="font-semibold" style={{ color: 'var(--t1)' }}>
                {weekDays[0]!.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })} — {weekDays[4]!.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t2)' }}>
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setWeekOffset(0)} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--cyan)' }}>
                Hoje
              </button>
            </div>
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['week', 'day', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className="px-3 py-1 rounded-lg text-xs font-semibold transition-all" style={{ background: view === v ? 'var(--s3)' : 'transparent', color: view === v ? 'var(--t1)' : 'var(--t3)' }}>
                  {v === 'week' ? 'Semana' : v === 'day' ? 'Dia' : 'Lista'}
                </button>
              ))}
            </div>
          </div>

          {/* Week view */}
          {view !== 'list' && (
            <div className="flex gap-4 overflow-x-auto pl-8 relative">
              {/* Hour labels */}
              <div className="absolute left-0 top-12 flex flex-col gap-0 pointer-events-none" style={{ width: '2rem' }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: '48px' }}>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>{h}</span>
                  </div>
                ))}
              </div>
              {weekDays.map((day, i) => (
                <DayColumn
                  key={i}
                  date={day}
                  events={MOCK_EVENTS}
                  selectedEvent={selectedEvent}
                  onEventClick={setSelectedEvent}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {view === 'list' && (
            <div className="flex flex-col gap-2">
              {MOCK_EVENTS.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(event => {
                const StatusIcon = STATUS_ICONS[event.status]
                return (
                  <div key={event.id} className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer tonal-hover" style={{ background: 'var(--s2)' }} onClick={() => setSelectedEvent(event)}>
                    <div className="w-16 flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{event.time}</p>
                      <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[event.type] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{event.title}</p>
                      <p className="text-xs" style={{ color: 'var(--t3)' }}>{event.contact} · {event.duration}min</p>
                    </div>
                    <StatusIcon size={14} style={{ color: STATUS_COLORS[event.status] }} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Event detail or Today's agenda */}
          {selectedEvent ? (
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          ) : (
            <div className="card p-5 flex flex-col gap-3">
              <p className="font-semibold" style={{ color: 'var(--t1)' }}>Agenda de Hoje</p>
              {todayEvents.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--t3)' }}>Sem eventos hoje</p>
              )}
              {todayEvents.map(event => (
                <div key={event.id} onClick={() => setSelectedEvent(event)} className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 tonal-hover" style={{ background: 'var(--s2)' }}>
                  <div className="w-12 text-center flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{event.time}</p>
                    <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{event.duration}min</p>
                  </div>
                  <div className="w-0.5 self-stretch rounded-full" style={{ background: TYPE_COLORS[event.type] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{event.title}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>{event.contact}</p>
                  </div>
                  {event.meet && <Video size={13} style={{ color: 'var(--cyan)' }} />}
                </div>
              ))}
            </div>
          )}

          {/* Booking link card */}
          <div className="card p-5 flex flex-col gap-3">
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>Link de Agendamento</p>
            <div className="px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: 'var(--s2)' }}>
              <Link2 size={12} style={{ color: 'var(--cyan)' }} />
              <p className="text-xs truncate flex-1" style={{ color: 'var(--t3)' }}>hypeflow.pt/book/ana</p>
              <button className="text-xs font-semibold" style={{ color: 'var(--cyan)' }}>Copiar</button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Discovery Call', duration: '30min', available: true },
                { label: 'Apresentação', duration: '60min', available: true },
                { label: 'Consultoria', duration: '90min', available: false },
              ].map(({ label, duration, available }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--s2)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--t2)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--t3)' }}>{duration}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ background: available ? 'var(--success)' : 'var(--t3)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="card p-5 flex flex-col gap-3">
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>Próximas</p>
            {upcomingEvents.slice(0, 4).map(event => (
              <div key={event.id} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedEvent(event)}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${TYPE_COLORS[event.type]}15` }}>
                  {event.type === 'call' ? <Phone size={12} style={{ color: TYPE_COLORS[event.type] }} /> : <Video size={12} style={{ color: TYPE_COLORS[event.type] }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{event.contact}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric' })} · {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
