'use client'

import { Clock, Link } from 'lucide-react'
import { Partner, TIER_CFG, STATUS_CFG } from './types'

interface Props {
  partner: Partner
  selected: boolean
  onClick: () => void
}

export function PartnerCard({ partner, selected, onClick }: Props) {
  const tier     = TIER_CFG[partner.tier]
  const status   = STATUS_CFG[partner.status]
  const convRate = partner.leads_sent > 0 ? Math.round((partner.leads_converted / partner.leads_sent) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer transition-all tonal-hover flex flex-col gap-3"
      style={{
        background:  'var(--s1)',
        boxShadow:   selected ? '0 0 0 1.5px rgba(33,160,196,0.4)' : 'var(--shadow-card)',
      }}
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: tier.bg }}
          >
            {tier.icon}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{partner.name}</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>{partner.company}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: tier.bg, color: tier.color }}>
            {tier.label}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${status.color}15`, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Leads',    value: partner.leads_sent },
          { label: 'Conv.',    value: `${convRate}%` },
          { label: 'Comissão', value: `€${(partner.commissions_earned / 1000).toFixed(1)}k` },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: 'var(--s2)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{s.value}</p>
            <p className="text-[9px]" style={{ color: 'var(--t3)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending commission alert */}
      {partner.commissions_pending > 0 && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <Clock size={10} style={{ color: '#F5A623' }} />
          <p className="text-[10px]" style={{ color: '#F5A623' }}>
            €{partner.commissions_pending.toLocaleString()} pendente de pagamento
          </p>
        </div>
      )}

      {/* Referral code */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl" style={{ background: 'var(--s2)' }}>
        <Link size={10} style={{ color: 'var(--t3)' }} />
        <span className="text-[10px] font-mono flex-1" style={{ color: 'var(--t3)' }}>{partner.referral_code}</span>
      </div>
    </div>
  )
}
