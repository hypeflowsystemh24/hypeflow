'use client'

import { useState } from 'react'
import { Users, Euro, Check, Clock, TrendingUp, Plus, Search, Download } from 'lucide-react'

import { PartnerCard }  from './components/PartnerCard'
import { PartnerPanel } from './components/PartnerPanel'
import { Partner, PartnerTier, TIER_CFG, MOCK_PARTNERS } from './components/types'

export default function ParceirosPage() {
  const [search, setSearch]         = useState('')
  const [tierFilter, setTierFilter] = useState<PartnerTier | 'all'>('all')
  const [selected, setSelected]     = useState<Partner | null>(null)

  const filtered = MOCK_PARTNERS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase())
    const matchTier   = tierFilter === 'all' || p.tier === tierFilter
    return matchSearch && matchTier
  })

  const totals = {
    earned:    MOCK_PARTNERS.reduce((s, p) => s + p.commissions_earned,  0),
    pending:   MOCK_PARTNERS.reduce((s, p) => s + p.commissions_pending, 0),
    leads:     MOCK_PARTNERS.reduce((s, p) => s + p.leads_sent,          0),
    converted: MOCK_PARTNERS.reduce((s, p) => s + p.leads_converted,     0),
  }

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 flex-shrink-0">
          <div>
            <h1 className="page-title">Parceiros</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Programa de referências e comissões</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tonal-hover"
              style={{ background: 'var(--s1)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Download size={12} />
              Relatório
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: 'var(--cyan)', color: '#0D1117' }}
            >
              <Plus size={12} />
              Convidar parceiro
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4 px-6 flex-shrink-0">
          {[
            { label: 'Comissões ganhas',    value: `€${(totals.earned / 1000).toFixed(1)}k`, icon: Euro,     color: '#1EC87A' },
            { label: 'Pendente pagar',      value: `€${totals.pending.toLocaleString()}`,     icon: Clock,    color: '#F5A623' },
            { label: 'Leads referenciados', value: totals.leads,                              icon: Users,    color: '#21A0C4' },
            { label: 'Convertidos',         value: totals.converted,                          icon: Check,    color: '#D1FF00' },
          ].map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-2xl p-4" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={14} style={{ color: k.color }} />
                  <TrendingUp size={11} style={{ color: 'var(--success)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>{k.label}</p>
              </div>
            )
          })}
        </div>

        {/* Search + tier filters */}
        <div className="flex items-center gap-3 px-6 flex-shrink-0">
          <div className="relative max-w-xs flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
            <input
              type="text"
              placeholder="Pesquisar parceiros..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: 'var(--s1)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTierFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: tierFilter === 'all' ? 'rgba(33,160,196,0.15)' : 'var(--s1)',
                color:      tierFilter === 'all' ? 'var(--cyan)' : 'var(--t3)',
                border:     `1px solid ${tierFilter === 'all' ? 'rgba(33,160,196,0.3)' : 'transparent'}`,
              }}
            >
              Todos
            </button>
            {(Object.entries(TIER_CFG) as [PartnerTier, (typeof TIER_CFG)[PartnerTier]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setTierFilter(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: tierFilter === key ? `${cfg.color}18` : 'var(--s1)',
                  color:      tierFilter === key ? cfg.color : 'var(--t3)',
                  border:     `1px solid ${tierFilter === key ? `${cfg.color}40` : 'transparent'}`,
                }}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier info strip */}
        <div className="flex gap-3 px-6 flex-shrink-0">
          {(Object.entries(TIER_CFG) as [PartnerTier, (typeof TIER_CFG)[PartnerTier]][]).map(([key, cfg]) => (
            <div key={key} className="flex-1 rounded-xl p-3 flex items-center gap-2" style={{ background: 'var(--s1)', border: `1px solid ${cfg.color}20` }}>
              <span className="text-base">{cfg.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-[9px]" style={{ color: 'var(--t3)' }}>≥{cfg.min_leads} leads · {cfg.commission}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Partner grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filtered.map(p => (
              <PartnerCard
                key={p.id}
                partner={p}
                selected={selected?.id === p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <PartnerPanel
          partner={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
