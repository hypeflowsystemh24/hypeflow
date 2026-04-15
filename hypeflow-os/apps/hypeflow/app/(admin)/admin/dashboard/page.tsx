'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Users, Phone,
  Zap, ArrowUpRight, Video, Activity,
  Target, Euro, AlertTriangle, ChevronRight,
  MessageSquare,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line,
} from 'recharts'
import { api } from '@/lib/trpc/client'

/* ─── mock data ─── */
const MOCK_LEADS_WEEK = [
  { d: 'Seg', v: 12 }, { d: 'Ter', v: 18 }, { d: 'Qua', v: 9 },
  { d: 'Qui', v: 24 }, { d: 'Sex', v: 21 }, { d: 'Sáb', v: 14 }, { d: 'Dom', v: 7 },
]
const MOCK_PIPELINE_STAGES = [
  { name: 'Nova',         count: 47, color: '#21A0C4' },
  { name: 'Qualificando', count: 28, color: '#F5A623' },
  { name: 'Agendada',     count: 19, color: '#4FC8EA' },
  { name: 'Proposta',     count: 12, color: '#D1FF00' },
  { name: 'Fechada',      count: 8,  color: '#00E5A0' },
]
const MOCK_TOTAL_PIPELINE = MOCK_PIPELINE_STAGES.reduce((s, p) => s + p.count, 0)

const MOCK_TODAY_CALLS = [
  { name: 'João Silva',    time: '10:00', type: 'Proposta',   score: 91, meet: true  },
  { name: 'Ana Ferreira',  time: '11:30', type: 'Descoberta', score: 74, meet: true  },
  { name: 'Carlos Mendes', time: '14:00', type: 'Follow-up',  score: 88, meet: true  },
  { name: 'Sofia Lopes',   time: '16:00', type: 'Proposta',   score: 95, meet: false },
]
const MOCK_RECENT_LEADS = [
  { name: 'Tiago Fonseca',  source: 'FB', score: 87, temp: 'hot',  stage: 'Agendada',    time: '2m' },
  { name: 'Ana Ferreira',   source: 'GG', score: 72, temp: 'warm', stage: 'Qualificada', time: '15m' },
  { name: 'Carlos Mendes',  source: 'IG', score: 91, temp: 'hot',  stage: 'Proposta',    time: '1h' },
  { name: 'Sofia Lopes',    source: 'LI', score: 65, temp: 'warm', stage: 'Contactada',  time: '2h' },
  { name: 'Miguel Costa',   source: 'WA', score: 44, temp: 'cold', stage: 'Nova Lead',   time: '3h' },
]
const ALERTS = [
  { text: '5 leads sem seguimento há +48h',      sev: 'high',   href: '/admin/pipeline?filter=inactive_48h' },
  { text: 'Meta Ads — token expira em 3 dias',   sev: 'medium', href: '/admin/config/integracoes' },
  { text: 'Call com Carlos Mendes em 30 min',    sev: 'info',   href: '/admin/calls' },
  { text: '3 leads score >85 sem call agendada', sev: 'high',   href: '/admin/pipeline?filter=high_score_no_call' },
]
const AUTOMATIONS_TODAY = [
  { name: 'Boas-vindas WhatsApp', runs: 14, icon: '💬' },
  { name: 'Alerta score alto',    runs: 3,  icon: '⭐' },
  { name: 'Follow-up 3 dias',     runs: 8,  icon: '⏰' },
]
const MOCK_CHANNEL_DATA = [
  { name: 'Meta',   v: 48, color: '#1877F2' },
  { name: 'Insta',  v: 22, color: '#E1306C' },
  { name: 'Google', v: 27, color: '#4285F4' },
  { name: 'LI',     v: 8,  color: '#0A66C2' },
  { name: 'Org',    v: 12, color: '#00E5A0' },
]
const MOCK_REV_DATA = [
  { m: 'Jan', v: 18400 }, { m: 'Fev', v: 22100 }, { m: 'Mar', v: 19800 },
  { m: 'Abr', v: 28600 }, { m: 'Mai', v: 31200 }, { m: 'Jun', v: 26800 },
]

const tempColor: Record<string, string> = { cold: '#4A6680', warm: '#F5A623', hot: '#E84545' }
const tempLabel: Record<string, string> = { cold: 'COLD', warm: 'WARM', hot: 'HOT' }
const sevColor: Record<string, string>  = { high: '#E84545', medium: '#F5A623', info: '#21A0C4' }

function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{value: number}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm" style={{ background: 'var(--s3)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p style={{ color: 'var(--t2)' }}>{label}</p>
      <p className="font-bold" style={{ color: 'var(--lime)' }}>{payload[0]?.value}</p>
    </div>
  )
}

type DashTab = 'prospeccao' | 'nurturing' | 'fecho'

export default function DashboardPage() {
  const [now] = useState(() => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }))
  const [dashTab, setDashTab] = useState<DashTab>('prospeccao')
  const overviewQuery = api.admin.dashboard.getOverview.useQuery()

  const LEADS_WEEK = overviewQuery.data?.leadsWeek?.length ? overviewQuery.data.leadsWeek : MOCK_LEADS_WEEK
  const PIPELINE_STAGES = overviewQuery.data?.pipelineStages?.length ? overviewQuery.data.pipelineStages : MOCK_PIPELINE_STAGES
  const TOTAL_PIPELINE = PIPELINE_STAGES.reduce((s: number, p: { count: number }) => s + p.count, 0)
  const TODAY_CALLS = overviewQuery.data?.todayCalls?.length ? overviewQuery.data.todayCalls : MOCK_TODAY_CALLS
  const RECENT_LEADS = overviewQuery.data?.recentLeads?.length ? overviewQuery.data.recentLeads : MOCK_RECENT_LEADS
  const CHANNEL_DATA = overviewQuery.data?.channelData?.length ? overviewQuery.data.channelData : MOCK_CHANNEL_DATA
  const REV_DATA = overviewQuery.data?.revData?.length ? overviewQuery.data.revData : MOCK_REV_DATA

  const kpis = overviewQuery.data?.kpis ?? {
    leadsToday: 24,
    callsToday: TODAY_CALLS.length,
    pipeline: MOCK_TOTAL_PIPELINE,
    mrr: 31200,
  }

  const weekTotalLeads = LEADS_WEEK.reduce((sum, item) => sum + item.v, 0)
  const formattedMrr = kpis.mrr >= 1000 ? `€${(kpis.mrr / 1000).toFixed(1)}k` : `€${kpis.mrr.toFixed(0)}`
  const execution = overviewQuery.data?.execution ?? {
    tfcMinutes: 4,
    hotWithoutContact: 3,
    conversionByChannel: [
      { channel: 'meta', rate: 15.4 },
      { channel: 'google_ads', rate: 13.2 },
      { channel: 'linkedin', rate: 8.1 },
    ],
  }
  const focusCards = overviewQuery.data?.focusCards ?? []

  /* ── Tab KPIs ── */
  const TAB_KPIS: Record<DashTab, { label: string; value: string; sub: string; color: string; delta: string; up: boolean }[]> = {
    prospeccao: [
      { label: 'Leads Hoje',      value: String(kpis.leadsToday), sub: 'últimas 24h',     color: 'var(--cyan)',    delta: '+24%', up: true  },
      { label: 'TFC Médio',       value: `${execution.tfcMinutes}min`,   sub: 'tempo 1º contacto', color: '#D1FF00',    delta: execution.tfcMinutes <= 5 ? '✓ SLA' : '⚠ SLA', up: execution.tfcMinutes <= 5 },
      { label: 'Hot sem contacto',value: String(execution.hotWithoutContact), sub: 'Sniper activo', color: '#E84545', delta: 'urgente', up: false },
      { label: 'Leads Semana',    value: String(weekTotalLeads),  sub: 'total 7 dias',     color: 'var(--success)', delta: '+18%', up: true  },
    ],
    nurturing: [
      { label: 'Score Médio',      value: '74',   sub: 'todos os leads',      color: 'var(--cyan)',    delta: '+3pts', up: true  },
      { label: 'Conversas Activas',value: '38',   sub: 'open conversations',  color: '#25D366',        delta: '+12%',  up: true  },
      { label: 'Open Rate Email',  value: '31.2%',sub: 'campanhas activas',   color: '#D1FF00',        delta: '+2.1%', up: true  },
      { label: 'Automações Hoje',  value: String(AUTOMATIONS_TODAY.reduce((s,a)=>s+a.runs, 0)), sub: 'execuções', color: '#F5A623', delta: '+8', up: true },
    ],
    fecho: [
      { label: 'Show-up Rate',     value: '78%',  sub: 'calls realizadas',    color: 'var(--success)', delta: '+5%',  up: true  },
      { label: 'Conv. Call→Prop.', value: '42%',  sub: 'proposta após call',  color: 'var(--cyan)',    delta: '+3%',  up: true  },
      { label: 'Propostas Enviadas',value: '12',  sub: 'este mês',            color: '#D1FF00',        delta: '+4',   up: true  },
      { label: 'MRR',              value: formattedMrr,           sub: 'clientes activos', color: '#F5A623',        delta: '+8%',  up: true  },
    ],
  }

  const TAB_LABELS: Record<DashTab, string> = {
    prospeccao: '🎯 Prospecção',
    nurturing:  '🔥 Nurturing',
    fecho:      '💰 Fecho',
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--t3)' }}>
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: 'var(--s1)' }}>
            <span className="w-2 h-2 rounded-full live-dot" style={{ background: 'var(--success)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--t2)' }}>{now}</span>
          </div>
          <Link href="/comercial">
            <button className="btn-lime gap-2 px-5 py-2.5 rounded-xl">
              <Users size={15} /> Nova Lead
            </button>
          </Link>
        </div>
      </div>

      {/* ── Perspective Tabs ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 px-1 py-1 rounded-2xl" style={{ background: 'var(--s1)' }}>
          {(Object.keys(TAB_LABELS) as DashTab[]).map(t => (
            <button
              key={t}
              onClick={() => setDashTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: dashTab === t ? 'var(--s3)' : 'transparent',
                color: dashTab === t ? 'var(--t1)' : 'var(--t3)',
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--t3)' }}>
          {dashTab === 'prospeccao' ? 'Métricas de aquisição e qualificação' : dashTab === 'nurturing' ? 'Métricas de engajamento e aquecimento' : 'Métricas de conversão e receita'}
        </p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-4 gap-4">
        {TAB_KPIS[dashTab].map(({ label, value, delta, up, sub, color }) => (
          <div key={label} className="card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--t2)' }}>{label}</p>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
            <div>
              <p className="num-hero">{value}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: up ? 'rgba(0,229,160,0.1)' : 'rgba(232,69,69,0.1)',
                    color: up ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {delta}
                </span>
                <span className="text-xs" style={{ color: 'var(--t3)' }}>{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--t3)' }}>TFC Médio</p>
          <p className="num-lg mt-1">{execution.tfcMinutes}min</p>
          <p className="text-xs mt-1" style={{ color: execution.tfcMinutes <= 5 ? 'var(--success)' : 'var(--danger)' }}>
            SLA alvo: &lt; 5 minutos
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--t3)' }}>Conversão por Canal</p>
          <div className="flex flex-wrap gap-2">
            {execution.conversionByChannel.map((item) => (
              <span key={item.channel} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                {item.channel}: <b>{item.rate}%</b>
              </span>
            ))}
          </div>
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--t3)' }}>Sniper</p>
            <p className="num-lg mt-1">{execution.hotWithoutContact}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>Hot leads sem contacto</p>
          </div>
          <Link href="/pipeline?hot=1" className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
            Abrir filtro rápido
          </Link>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Leads semana */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--t2)' }}>Leads por dia</p>
              <p className="num-lg">{weekTotalLeads} <span className="text-base font-normal" style={{ color: 'var(--t3)' }}>esta semana</span></p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--success)' }}>
              <TrendingUp size={13} /> +24%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={LEADS_WEEK} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#21A0C4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#21A0C4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="v" stroke="#21A0C4" strokeWidth={2} fill="url(#ag)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Calls hoje */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Calls Hoje</p>
            <Link href="/calls" className="flex items-center gap-1 text-sm" style={{ color: 'var(--cyan)' }}>
              Ver <ChevronRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {TODAY_CALLS.map((call: { name: string; time: string; type: string; score: number; meet: boolean }) => {
              const [h, m] = call.time.split(':').map(Number)
              const callTime = new Date(); callTime.setHours(h!, m!, 0)
              const isPast = callTime < new Date()
              return (
                <div key={call.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--s2)' }}>
                  <div
                    className="w-12 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isPast ? 'var(--s3)' : 'rgba(209,255,0,0.12)',
                      color: isPast ? 'var(--t3)' : '#D1FF00',
                    }}
                  >
                    {call.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{call.name}</p>
                    <p className="text-xs" style={{ color: 'var(--t3)' }}>{call.type}</p>
                  </div>
                  {call.meet && !isPast && (
                    <Video size={14} style={{ color: 'var(--success)' }} />
                  )}
                  {isPast && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--success)' }}>
                      ✓
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Secondary row ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Pipeline */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Pipeline</p>
            <Link href="/pipeline" className="flex items-center gap-1 text-sm" style={{ color: 'var(--cyan)' }}>
              Kanban <ArrowUpRight size={13} />
            </Link>
          </div>
          {PIPELINE_STAGES.map((s: { name: string; count: number; color: string }) => (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm" style={{ color: 'var(--t2)' }}>{s.name}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{s.count}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--s3)' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${(s.count / TOTAL_PIPELINE) * 100}%`, background: s.color }} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-sm" style={{ color: 'var(--t3)' }}>Total activos</span>
            <span className="num-md">{TOTAL_PIPELINE}</span>
          </div>
        </div>

        {/* Canais */}
        <div className="card p-5">
          <p className="text-base font-semibold mb-4" style={{ color: 'var(--t1)' }}>Leads por Canal</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={CHANNEL_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
              <XAxis dataKey="name" tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {CHANNEL_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Receita */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Receita</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(209,255,0,0.1)', color: '#D1FF00' }}>+18%</span>
          </div>
          <p className="num-lg mb-4">{formattedMrr}</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={REV_DATA} margin={{ top: 0, right: 4, bottom: 0, left: -28 }}>
              <XAxis dataKey="m" tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A6680', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="v" stroke="#D1FF00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent leads */}
        <div className="col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Feed de Leads</p>
            <Link href="/admin/contactos" className="flex items-center gap-1 text-sm" style={{ color: 'var(--cyan)' }}>
              Ver todos <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="flex flex-col">
            {RECENT_LEADS.map((lead: { name: string; source: string; score: number; temp: string; stage: string; time: string; id?: string }, i: number) => (
              <Link
                key={i}
                href={`/admin/contactos/${lead.id ?? (i + 1)}`}
                className="group flex items-center gap-3 px-3 py-3 rounded-xl tonal-hover cursor-pointer relative"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>
                  {lead.source}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{lead.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{lead.stage}</p>
                </div>

                {/* Default: badges */}
                <div className="flex items-center gap-2 group-hover:opacity-0 transition-opacity">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${tempColor[lead.temp]}18`, color: tempColor[lead.temp] }}>
                    {tempLabel[lead.temp]}
                  </span>
                  <span className="text-sm font-bold w-8 text-right" style={{ color: 'var(--t1)' }}>{lead.score}</span>
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--t3)' }}>{lead.time}</span>
                </div>

                {/* Hover: quick actions (fade-in 200ms) */}
                <div
                  className="absolute right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: '200ms' }}
                  onClick={e => e.preventDefault()}
                >
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}
                  >
                    <MessageSquare size={11} /> Mensagem
                  </a>
                  <button
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}
                  >
                    <Phone size={11} /> Call
                  </button>
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'var(--s2)', color: 'var(--t2)' }}
                  >
                    Ver Perfil
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Alerts + automations */}
        <div className="flex flex-col gap-4">
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Alertas</p>
              <AlertTriangle size={14} style={{ color: '#F5A623' }} />
            </div>
            {ALERTS.map((a, i) => (
              <Link key={i} href={a.href}>
                <div className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 -mx-2 tonal-hover cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: sevColor[a.sev] }} />
                  <p className="text-sm" style={{ color: 'var(--t2)' }}>{a.text}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Focus Mode</p>
              <Zap size={14} style={{ color: '#D1FF00' }} />
            </div>
            {focusCards.length === 0 && AUTOMATIONS_TODAY.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{a.icon}</span>
                <p className="flex-1 text-sm truncate" style={{ color: 'var(--t2)' }}>{a.name}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(209,255,0,0.1)', color: '#D1FF00' }}>
                  {a.runs}×
                </span>
              </div>
            ))}
            {focusCards.map((card: { id: string; score: number; name: string; ageHours: number }) => (
              <div key={card.id} className="flex items-center gap-2.5">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(232,69,69,0.15)', color: 'var(--danger)' }}>
                  {card.score}
                </span>
                <p className="flex-1 text-sm truncate" style={{ color: 'var(--t2)' }}>{card.name}</p>
                <span className="text-[11px]" style={{ color: 'var(--t3)' }}>{card.ageHours}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
