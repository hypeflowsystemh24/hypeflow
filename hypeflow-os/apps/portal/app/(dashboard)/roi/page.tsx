'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Euro, Target, Users } from 'lucide-react'

/* ── mock data ── */

const MONTHLY_DATA = [
  { month: 'Jan', leads: 68,  spend: 320,  revenue: 4200, cpl: 4.71 },
  { month: 'Fev', leads: 72,  spend: 310,  revenue: 5100, cpl: 4.31 },
  { month: 'Mar', leads: 89,  spend: 380,  revenue: 6800, cpl: 4.27 },
  { month: 'Abr', leads: 95,  spend: 390,  revenue: 7200, cpl: 4.11 },
  { month: 'Mai', leads: 112, spend: 420,  revenue: 9400, cpl: 3.75 },
  { month: 'Jun', leads: 105, spend: 441,  revenue: 8700, cpl: 4.20 },
]

const CHANNEL_DATA = [
  { name: 'Facebook Ads', leads: 48, spend: 180, color: '#1877F2' },
  { name: 'Google Ads',   leads: 27, spend: 140, color: '#4285F4' },
  { name: 'TikTok Ads',   leads: 19, spend: 95,  color: '#69C9D0' },
  { name: 'Instagram',    leads: 18, spend: 80,  color: '#E1306C' },
  { name: 'Orgânico',     leads: 12, spend: 0,   color: '#00E5A0' },
]

const FUNNEL = [
  { stage: 'Leads Totais', count: 105, color: '#21A0C4' },
  { stage: 'Qualificadas', count: 62,  color: '#4FC8EA' },
  { stage: 'Calls',        count: 28,  color: '#F5A623' },
  { stage: 'Propostas',    count: 14,  color: '#E8A838' },
  { stage: 'Fechadas',     count: 8,   color: '#00E5A0' },
]

const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1]!
const prevMonth    = MONTHLY_DATA[MONTHLY_DATA.length - 2]!
const roiPct       = Math.round(((currentMonth.revenue - currentMonth.spend) / currentMonth.spend) * 100)
const roiChange    = roiPct - Math.round(((prevMonth.revenue - prevMonth.spend) / prevMonth.spend) * 100)

type TooltipPayloadItem = { name: string; color?: string; fill?: string; value?: number | string }

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--s0)', border: '1px solid var(--glass-border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--t1)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `€${p.value}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ROIPage() {
  const [period, setPeriod] = useState<'3m' | '6m'>('6m')
  const data = period === '6m' ? MONTHLY_DATA : MONTHLY_DATA.slice(-3)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">ROI & Métricas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t2)' }}>Performance detalhada das suas campanhas</p>
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--s2)', border: '1px solid var(--glass-border)' }}>
          {(['3m', '6m'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 text-xs font-bold transition-colors"
              style={{
                background: period === p ? 'var(--cyan)' : 'transparent',
                color: period === p ? '#0D1117' : 'var(--t2)',
              }}
            >
              {p === '3m' ? '3 meses' : '6 meses'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ROI',            value: `${roiPct}%`, change: roiChange, icon: TrendingUp, color: '#00E5A0' },
          { label: 'Receita gerada', value: `€${currentMonth.revenue.toLocaleString()}`, change: Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100), icon: Euro, color: 'var(--cyan)' },
          { label: 'Gasto em ads',   value: `€${currentMonth.spend}`, change: Math.round(((currentMonth.spend - prevMonth.spend) / prevMonth.spend) * 100), icon: Target, color: 'var(--warning)' },
          { label: 'Leads geradas',  value: currentMonth.leads, change: Math.round(((currentMonth.leads - prevMonth.leads) / prevMonth.leads) * 100), icon: Users, color: '#4FC8EA' },
        ].map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="tag-label">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="num-lg">{value}</p>
            <div
              className="flex items-center gap-1 mt-1.5 text-xs font-bold"
              style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(change)}% vs. mês anterior
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Spend */}
      <div className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mb-4">
          <p className="card-title">Receita vs. Investimento</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t2)' }}>Evolução mensal — ROI por período</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" fill="#21A0C4"   radius={[4,4,0,0]} name="Receita" />
            <Bar dataKey="spend"   fill="#21A0C422" radius={[4,4,0,0]} name="Investimento" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel + Funnel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Channel breakdown */}
        <div className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
          <p className="card-title mb-4">Performance por Canal</p>
          <div className="flex flex-col gap-3">
            {CHANNEL_DATA.map(ch => {
              const cpl     = ch.leads > 0 && ch.spend > 0 ? (ch.spend / ch.leads).toFixed(2) : 'Grátis'
              const maxLeads = Math.max(...CHANNEL_DATA.map(c => c.leads))
              return (
                <div key={ch.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{ch.name}</span>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--t2)' }}>
                      <span>{ch.leads} leads</span>
                      <span className="font-bold" style={{ color: 'var(--t1)' }}>CPL: {typeof cpl === 'string' ? cpl : `€${cpl}`}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s0)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(ch.leads / maxLeads) * 100}%`, background: ch.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
          <p className="card-title mb-4">Funil de Conversão</p>
          <div className="flex flex-col gap-2">
            {FUNNEL.map((stage, i) => {
              const pct = i === 0 ? 100 : Math.round((stage.count / FUNNEL[0]!.count) * 100)
              return (
                <div key={stage.stage} className="flex items-center gap-3">
                  <div
                    className="h-8 rounded-xl flex items-center px-3 transition-all"
                    style={{
                      width: `${Math.max(pct, 15)}%`,
                      background: `${stage.color}20`,
                      borderLeft: `3px solid ${stage.color}`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: 'var(--t1)', whiteSpace: 'nowrap' }}>{stage.count}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'var(--t2)' }}>{stage.stage}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--t3)' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 flex justify-between" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <span className="text-xs" style={{ color: 'var(--t2)' }}>Taxa de fecho</span>
            <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
              {Math.round((FUNNEL[4]!.count / FUNNEL[0]!.count) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* CPL trend */}
      <div className="card border p-5" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mb-4">
          <p className="card-title">Evolução do CPL</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t2)' }}>Custo por lead ao longo do tempo — quanto menor, melhor</p>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4A6680', fontSize: 10 }} axisLine={false} tickLine={false} width={30} domain={[3, 6]} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="cpl" stroke="#00E5A0" strokeWidth={2.5} dot={{ fill: '#00E5A0', r: 3 }} name="CPL €" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
