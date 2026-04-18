'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Partner, TIER_CFG, STATUS_CFG, LEAD_STATUS_CFG } from './types'

interface Props {
  partner: Partner
  onClose: () => void
}

export function PartnerPanel({ partner, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const tier     = TIER_CFG[partner.tier]
  const status   = STATUS_CFG[partner.status]
  const convRate = partner.leads_sent > 0 ? Math.round((partner.leads_converted / partner.leads_sent) * 100) : 0

  const copyCode = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/parceiros/${partner.referral_code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="w-[420px] flex-shrink-0 flex flex-col animate-slide-in"
      style={{ background: 'var(--s1)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: tier.bg }}>
            {tier.icon}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>{partner.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold" style={{ color: tier.color }}>{tier.label}</span>
              <span className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Leads enviados',  value: partner.leads_sent,            color: 'var(--cyan)' },
            { label: 'Convertidos',     value: partner.leads_converted,       color: 'var(--success)' },
            { label: 'Taxa conversão',  value: `${convRate}%`,                color: convRate >= 30 ? 'var(--success)' : '#F5A623' },
            { label: 'Comissão %',      value: `${partner.commission_rate}%`, color: '#D1FF00' },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3" style={{ background: 'var(--s2)' }}>
              <p className="text-base font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Commission summary */}
        <div className="rounded-xl p-4" style={{ background: 'var(--s2)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Comissões</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--t2)' }}>Total ganho</span>
            <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>€{partner.commissions_earned.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: 'var(--t2)' }}>Pendente</span>
            <span className="text-sm font-bold" style={{ color: '#F5A623' }}>€{partner.commissions_pending.toLocaleString()}</span>
          </div>
          {partner.commissions_pending > 0 && (
            <button
              className="w-full py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
            >
              Processar pagamento pendente
            </button>
          )}
        </div>

        {/* Referral link */}
        <div className="rounded-xl p-3 flex flex-col gap-2" style={{ background: 'var(--s2)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>Link de referência</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-2.5 py-1.5 rounded-lg overflow-hidden" style={{ background: 'var(--s3)' }}>
              <p className="text-[10px] font-mono truncate" style={{ color: 'var(--t3)' }}>/parceiros/{partner.referral_code}</p>
            </div>
            <button
              onClick={copyCode}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
              style={{ background: copied ? 'rgba(0,229,160,0.1)' : 'rgba(33,160,196,0.12)', color: copied ? 'var(--success)' : 'var(--cyan)' }}
            >
              <Copy size={10} />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Leads list */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>
            Leads referenciados ({partner.leads.length})
          </p>
          <div className="flex flex-col gap-2">
            {partner.leads.map(lead => {
              const lc = LEAD_STATUS_CFG[lead.status]
              return (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--s2)' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>{lead.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{lead.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold" style={{ color: 'var(--cyan)' }}>€{lead.value.toLocaleString()}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${lc.color}15`, color: lc.color }}>
                      {lc.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Email',             value: partner.email },
            { label: 'Empresa',           value: partner.company },
            { label: 'Parceiro desde',    value: new Date(partner.since).toLocaleDateString('pt-PT') },
            { label: 'Última actividade', value: new Date(partner.last_activity).toLocaleDateString('pt-PT') },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <span className="text-xs" style={{ color: 'var(--t3)' }}>{row.label}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--t1)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
