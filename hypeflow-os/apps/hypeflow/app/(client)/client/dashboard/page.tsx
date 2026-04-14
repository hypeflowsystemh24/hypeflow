'use client'

import {
  TrendingUp, TrendingDown, Users, Phone,
  Euro, Target, ArrowUpRight, Zap,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

/* ── mock data ── */

const WEEKLY_LEADS = [
  { day: 'Seg', leads: 12, conversions: 2 },
  { day: 'Ter', leads: 18, conversions: 3 },
  { day: 'Qua', leads: 9,  conversions: 1 },
  { day: 'Qui', leads: 24, conversions: 5 },
  { day: 'Sex', leads: 21, conversions: 4 },
  { day: 'Sáb', leads: 14, conversions: 2 },
  { day: 'Dom', leads: 7,  conversions: 1 },
]

const RECENT_LEADS = [
  { name: 'João Silva',    source: 'Facebook',   status: 'Proposta',    value: '€2.400', time: '10 min' },
  { name: 'Ana Ferreira',  source: 'Google Ads',  status: 'Agendada',    value: '€1.800', time: '1h' },
  { name: 'Carlos Mendes', source: 'Instagram',   status: 'Qualificada', value: '€3.200', time: '2h' },
  { name: 'Sofia Lopes',   source: 'LinkedIn',    status: 'Nova',        value: '—',      time: '3h' },
  { name: 'Miguel Costa',  source: 'Facebook',    status: 'Fechada ✓',  value: '€5.000', time: '4h' },
]

const STATUS_COLORS: Record<string, string> = {
  'Nova': '#8AAEC8',
  'Qualificada': '#21A0C4',
  'Agendada': '#00E5A0',
  'Proposta': '#F5A623',
  'Fechada ✓': '#00E5A0',
}

type TooltipPayloadItem = { name: string; color?: string; value?: number | string }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--s0)', border: '1px solid var(--glass-border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--t1)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function KpiCard({
  label, value, change, prefix = '', icon: Icon, color,
}: {
  label: string; value: string | number; change?: number
  prefix?: string; icon: typeof Users; color: string
}) {
  return (
    <div className="card p-5 flex flex-col gap-3 border" style={{ borderColor: 'var(--glass-border)' }}>
      <div className="flex items-center justify-between">
        <p className="tag-label">{label}</p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}22` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="num-hero">{prefix}{value}</p>
        {change !== undefined && (
          <div
            className="flex items-center gap-1 mt-1.5 text-xs font-bold"
            style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}% vs. mês anterior
          </div>
        )}
      </div>
    </div>
  )
}

export default function PortalDashboard() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Bom dia, TechnoSpark 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--t2)' }}>Aqui estão os seus resultados desta semana</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Leads esta semana"  value={105}  change={+12.4} icon={Users}  color="var(--cyan)" />
        <KpiCard label="Custo por lead"     value="4,20" change={-8.3}  prefix="€" icon={Euro}   color="var(--success)" />
        <KpiCard label="Calls agendadas"    value={14}   change={+5.1}  icon={Phone}  color="var(--warning)" />
        <KpiCard label="Negócios fechados"  value={8}    change={+33.3} icon={Target} color="#E8A838" />
      </div>

      {/* Chart + recent leads */}
      <div className="grid grid-cols-5 gap-4">
        {/* Line chart */}
        <div className="col-span-3 card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="card-title">Leads & Conversões</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t2)' }}>Últimos 7 dias</p>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--t3)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--cyan)' }} />Leads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />Conversões
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={WEEKLY_LEADS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="leads" stroke="var(--cyan)" strokeWidth={2} dot={false} name="Leads" />
              <Line type="monotone" dataKey="conversions" stroke="var(--success)" strokeWidth={2} dot={false} name="Conversões" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent leads */}
        <div className="col-span-2 card border p-5 flex flex-col" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="card-title">Leads Recentes</p>
            <a
              href="/leads"
              className="text-xs font-bold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--cyan)' }}
            >
              Ver todas <ArrowUpRight size={11} />
            </a>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {RECENT_LEADS.map((lead, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--cyan-glow)', color: 'var(--cyan)' }}
                >
                  {lead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--t1)' }}>{lead.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{lead.source}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: STATUS_COLORS[lead.status] ?? 'var(--t2)' }}>
                    {lead.status}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--t3)' }}>{lead.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: 'Próxima Call',
            value: 'Hoje 14:00',
            sub: 'João Silva — Proposta €2.400',
            icon: Phone,
            color: 'var(--cyan)',
            action: 'Ver detalhes',
            href: '/calls',
          },
          {
            title: 'Melhor Canal',
            value: 'Facebook Ads',
            sub: 'CPL: €3.20 · 48 leads esta semana',
            icon: TrendingUp,
            color: 'var(--success)',
            action: 'Ver métricas',
            href: '/roi',
          },
          {
            title: 'Automações Activas',
            value: '3 a correr',
            sub: 'Boas-vindas · Score alto · Follow-up',
            icon: Zap,
            color: 'var(--warning)',
            action: 'Ver pipeline',
            href: '/pipeline',
          },
        ].map(({ title, value, sub, icon: Icon, color, action, href }) => (
          <div key={title} className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${color.startsWith('var') ? '' : color}22`, backgroundColor: `${color}22` }}
              >
                <Icon size={15} style={{ color }} />
              </div>
              <p className="tag-label">{title}</p>
            </div>
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--t1)', fontFamily: 'var(--font-syne)' }}>{value}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--t3)' }}>{sub}</p>
            <a href={href} className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--cyan)' }}>
              {action} <ArrowUpRight size={10} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
