'use client'

import { useState, useRef } from 'react'
import { Search, X, ChevronRight, Download, Upload, Check } from 'lucide-react'

/* ── types ── */

type LeadStatus = 'new' | 'qualifying' | 'qualified' | 'scheduled' | 'proposal' | 'closed' | 'lost'
type LeadTemp   = 'cold' | 'warm' | 'hot'

interface Lead {
  id: string; name: string; email: string; phone: string
  source: string; temperature: LeadTemp; score: number
  status: LeadStatus; created_at: string; last_contact: string | null
}

/* ── mock data ── */

const MOCK_LEADS: Lead[] = Array.from({ length: 22 }, (_, i) => ({
  id: `l${i}`,
  name: ['João Silva','Ana Ferreira','Carlos Mendes','Sofia Lopes','Miguel Costa','Rita Oliveira','Pedro Santos','Inês Rodrigues'][i % 8]!,
  email: `lead${i}@email.com`,
  phone: `+351 9${String(60000000 + i * 7777)}`,
  source: ['facebook','instagram','google_ads','linkedin','organic','tiktok'][i % 6]!,
  temperature: (['cold','warm','hot'] as const)[i % 3]!,
  score: 35 + (i * 8) % 55,
  status: (['new','qualifying','qualified','scheduled','proposal','closed','lost'] as const)[i % 7]!,
  created_at: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
  last_contact: i % 4 === 0 ? null : new Date(Date.now() - i * 3600000 * 3).toISOString(),
}))

/* ── config ── */

const STATUS_CFG: Record<LeadStatus, { label: string; color: string }> = {
  new:        { label: 'Nova',          color: '#8AAEC8' },
  qualifying: { label: 'Qualificando',  color: '#F5A623' },
  qualified:  { label: 'Qualificada',   color: '#21A0C4' },
  scheduled:  { label: 'Agendada',      color: '#4FC8EA' },
  proposal:   { label: 'Proposta',      color: '#E8A838' },
  closed:     { label: 'Fechada ✓',     color: '#00E5A0' },
  lost:       { label: 'Perdida ✗',     color: '#E84545' },
}

const TEMP_CFG: Record<LeadTemp, { label: string; color: string; bg: string }> = {
  cold: { label: 'Frio',   color: '#4A6680', bg: 'rgba(74,102,128,0.15)' },
  warm: { label: 'Morno',  color: '#F5A623', bg: 'rgba(245,166,35,0.15)' },
  hot:  { label: 'Quente', color: '#E84545', bg: 'rgba(232,69,69,0.15)'  },
}

const SOURCE_LABEL: Record<string, string> = {
  facebook:  'Facebook',
  instagram: 'Instagram',
  google_ads:'Google Ads',
  linkedin:  'LinkedIn',
  organic:   'Orgânico',
  tiktok:    'TikTok',
}

/* ── Import modal ── */

function ImportModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [fileName, setFileName] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    setStep('preview')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-2xl p-6 w-[480px] flex flex-col gap-5" style={{ background: 'var(--s1)', border: '1px solid var(--glass-border)' }}>
        <div className="flex items-center justify-between">
          <p className="card-title">Importar Leads (CSV)</p>
          <button onClick={onClose}><X size={16} style={{ color: 'var(--t3)' }} /></button>
        </div>

        {step === 'upload' && (
          <div
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer"
            style={{ borderColor: 'var(--glass-border)' }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={28} style={{ color: 'var(--cyan)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Clique para seleccionar ficheiro</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>CSV com colunas: nome, email, telefone, fonte, estado</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>
        )}

        {step === 'preview' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--t2)' }}>Ficheiro: <span style={{ color: 'var(--t1)' }}>{fileName}</span></p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--s2)' }}>
                    {['Nome','Email','Fonte','Estado'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--t3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['João Silva','joao@email.com','Facebook','Nova'],
                    ['Ana Costa','ana@email.com','Google Ads','Qualificada'],
                    ['Pedro Lima','pedro@email.com','Instagram','Proposta'],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2" style={{ color: 'var(--t1)' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn-lime w-full justify-center py-2.5 text-sm" onClick={() => setStep('done')}>
              Confirmar Importação
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,229,160,0.15)' }}>
              <Check size={28} style={{ color: 'var(--success)' }} />
            </div>
            <p className="text-base font-bold" style={{ color: 'var(--t1)' }}>Importação concluída!</p>
            <p className="text-sm" style={{ color: 'var(--t2)' }}>3 leads importadas com sucesso</p>
            <button className="btn-lime py-2 px-6 text-sm" onClick={onClose}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── detail panel ── */

function LeadPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const temp   = TEMP_CFG[lead.temperature]
  const status = STATUS_CFG[lead.status]

  return (
    <div className="w-80 flex-shrink-0 flex flex-col animate-slide-in" style={{ background: 'var(--s1)', borderLeft: '1px solid var(--glass-border)' }}>
      <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--t1)' }}>{lead.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t2)' }}>{lead.email}</p>
        </div>
        <button onClick={onClose}>
          <X size={14} style={{ color: 'var(--t3)' }} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 px-5 py-3 flex-wrap" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: temp.color, background: temp.bg }}>{temp.label}</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: status.color, background: `${status.color}20` }}>{status.label}</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
          Score: <span style={{ color: 'var(--cyan)' }}>{lead.score}</span>
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div>
          <p className="tag-label mb-3">Informação</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Telefone', value: lead.phone },
              { label: 'Fonte',    value: SOURCE_LABEL[lead.source] ?? lead.source },
              { label: 'Criada',   value: new Date(lead.created_at).toLocaleDateString('pt-PT') },
              { label: 'Último contacto', value: lead.last_contact ? new Date(lead.last_contact).toLocaleDateString('pt-PT') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--t2)' }}>{label}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel progress */}
        <div>
          <p className="tag-label mb-3">Progresso no Funil</p>
          {(['new','qualifying','qualified','scheduled','proposal','closed'] as LeadStatus[]).map((s, i) => {
            const steps: LeadStatus[] = ['new','qualifying','qualified','scheduled','proposal','closed']
            const idx  = steps.indexOf(lead.status)
            const done = i <= idx && lead.status !== 'lost'
            return (
              <div key={s} className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: done ? 'var(--cyan)' : 'var(--glass-border)',
                    background: done ? 'var(--cyan)' : 'transparent',
                  }}
                >
                  {done && <span className="text-xs font-bold" style={{ color: '#0D1117' }}>✓</span>}
                </div>
                <span className="text-xs" style={{ color: done ? 'var(--t1)' : 'var(--t3)', fontWeight: done ? 700 : 400 }}>
                  {STATUS_CFG[s].label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── export ── */

function exportCSV(leads: Lead[]) {
  const header = 'Nome,Email,Telefone,Fonte,Temperatura,Score,Estado,Criada'
  const rows = leads.map(l =>
    [l.name, l.email, l.phone, l.source, l.temperature, l.score, STATUS_CFG[l.status].label, new Date(l.created_at).toLocaleDateString('pt-PT')].join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── page ── */

export default function LeadsPage() {
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showImport, setShowImport]   = useState(false)

  const filtered = MOCK_LEADS.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <div className="flex h-full gap-0 animate-fade-in">
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">As Minhas Leads</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--t2)' }}>
                {MOCK_LEADS.length} leads no pipeline · {MOCK_LEADS.filter(l => l.status === 'closed').length} fechadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowImport(true)} className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl">
                <Upload size={13} /> Importar
              </button>
              <button onClick={() => exportCSV(filtered)} className="btn-lime text-xs px-3 py-2 rounded-xl">
                <Download size={13} /> Exportar CSV
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {(['new', 'qualified', 'proposal', 'closed'] as const).map(s => {
              const count = MOCK_LEADS.filter(l => l.status === s).length
              const cfg   = STATUS_CFG[s]
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                  className="card border rounded-xl p-3 text-left transition-all"
                  style={{ borderColor: statusFilter === s ? 'var(--cyan)' : 'var(--glass-border)' }}
                >
                  <p className="num-md">{count}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-xs"
              style={{ background: 'var(--s2)', border: '1px solid var(--glass-border)' }}
            >
              <Search size={13} style={{ color: 'var(--t3)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar leads..."
                className="bg-transparent text-sm placeholder-[#4A6680] focus:outline-none w-full"
                style={{ color: 'var(--t1)' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')}
              className="text-sm rounded-xl px-3 py-2 focus:outline-none"
              style={{ background: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--glass-border)' }}
            >
              <option value="all">Todos os estados</option>
              {(Object.entries(STATUS_CFG) as [LeadStatus, { label: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="card border flex-1 overflow-hidden" style={{ borderColor: 'var(--glass-border)' }}>
            <div className="overflow-x-auto h-full overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    {['Lead','Fonte','Score','Temperatura','Estado','Último Contacto',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 whitespace-nowrap tag-label">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => {
                    const temp   = TEMP_CFG[lead.temperature]
                    const status = STATUS_CFG[lead.status]
                    const isSelected = selectedLead?.id === lead.id
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(isSelected ? null : lead)}
                        className="cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid var(--glass-border)',
                          background: isSelected ? 'var(--cyan-glow)' : 'transparent',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--s2)' }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ background: 'var(--cyan-glow)', color: 'var(--cyan)' }}
                            >
                              {lead.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{lead.name}</p>
                              <p className="text-xs" style={{ color: 'var(--t3)' }}>{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--t2)' }}>
                          {SOURCE_LABEL[lead.source] ?? lead.source}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-sm font-bold"
                            style={{ color: lead.score >= 70 ? 'var(--success)' : lead.score >= 50 ? 'var(--warning)' : 'var(--t2)' }}
                          >
                            {lead.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: temp.color, background: temp.bg }}>
                            {temp.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold" style={{ color: status.color }}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--t3)' }}>
                          {lead.last_contact
                            ? new Date(lead.last_contact).toLocaleDateString('pt-PT')
                            : <span style={{ color: 'var(--danger)' }}>Sem contacto</span>}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight size={13} style={{ color: isSelected ? 'var(--cyan)' : 'var(--t3)' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedLead && (
          <LeadPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </div>
    </>
  )
}
