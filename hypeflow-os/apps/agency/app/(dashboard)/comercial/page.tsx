'use client'

import { useState, useRef } from 'react'
import {
  Search, Plus, Phone, Calendar, MessageSquare,
  ChevronRight, Download, TrendingUp, TrendingDown,
  FileText, Upload, X, Check,
} from 'lucide-react'
import { PlatformIcon } from '@/components/icons/PlatformIcons'

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'FB', instagram: 'IG', google: 'GG',
  linkedin: 'LI', whatsapp: 'WA', tiktok: 'TT',
  email: 'EM', manual: 'MN', organic: 'ORG',
}

const PLATFORM_SOURCES = new Set(['facebook', 'instagram', 'google', 'linkedin', 'whatsapp', 'tiktok', 'meta'])

const TEMP_CONFIG = {
  cold:  { label: 'COLD', color: '#3D5570' },
  warm:  { label: 'WARM', color: '#F5A623' },
  hot:   { label: 'HOT',  color: '#E84545' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:        { label: 'Nova',          color: '#7FA8C4' },
  qualifying: { label: 'Qualificando',  color: '#F5A623' },
  qualified:  { label: 'Qualificada',   color: '#21A0C4' },
  contacted:  { label: 'Contactada',    color: '#4FC8EA' },
  scheduled:  { label: 'Agendada',      color: '#00E5A0' },
  proposal:   { label: 'Proposta',      color: '#D1FF00' },
  closed:     { label: 'Fechada ✓',     color: '#00E5A0' },
  lost:       { label: 'Perdida ✗',     color: '#E84545' },
}

const MOCK_LEADS = Array.from({ length: 24 }, (_, i) => ({
  id: `lead-${i}`,
  full_name: ['João Silva', 'Ana Ferreira', 'Carlos Mendes', 'Sofia Lopes', 'Miguel Costa',
    'Rita Oliveira', 'Pedro Santos', 'Inês Rodrigues', 'Rui Carvalho', 'Marta Pereira'][i % 10]!,
  email: `lead${i}@email.com`,
  phone: `+351 9${String(Math.floor(Math.random() * 89999999 + 10000000))}`,
  source: ['facebook', 'instagram', 'google', 'linkedin', 'whatsapp', 'tiktok'][i % 6]!,
  temperature: ['cold', 'warm', 'hot'][i % 3] as 'cold' | 'warm' | 'hot',
  score: 30 + ((i * 13 + 7) % 65),
  status: Object.keys(STATUS_CONFIG)[i % 8]!,
  created_at: new Date(Date.now() - i * 3600000 * 8).toISOString(),
  last_contact_at: i % 3 === 0 ? null : new Date(Date.now() - i * 3600000 * 2).toISOString(),
  agent: { full_name: ['Dex Silva', 'Quinn Costa', 'River Lopes'][i % 3]! },
}))

type Lead = typeof MOCK_LEADS[number]

/* ─── detail panel ─── */
function LeadDetailPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const temp = TEMP_CONFIG[lead.temperature]
  const status = STATUS_CONFIG[lead.status]

  return (
    <div
      className="w-96 flex-shrink-0 flex flex-col animate-slide-in"
      style={{ background: 'var(--s1)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6">
        <div>
          <h2 className="display-title text-xl" style={{ color: 'var(--t1)' }}>{lead.full_name}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--t2)' }}>{lead.email}</p>
        </div>
        <button
          onClick={onClose}
          className="tonal-hover p-2 rounded-xl transition-colors text-lg leading-none"
          style={{ color: 'var(--t3)' }}
        >
          ✕
        </button>
      </div>

      {/* Score + temp + status row */}
      <div className="grid grid-cols-3 gap-2 px-6 pb-5">
        {[
          { label: 'SCORE', value: String(lead.score), color: lead.score >= 80 ? 'var(--success)' : lead.score >= 50 ? '#F5A623' : 'var(--t3)' },
          { label: 'TEMP', value: temp.label, color: temp.color },
          { label: 'ESTADO', value: status?.label ?? '—', color: status?.color ?? 'var(--t3)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--s2)' }}>
            <p className="font-manrope font-800 text-base" style={{ color }}>{value}</p>
            <p className="label-system mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-5">
        <div>
          <p className="label-system mb-3">DETALHES</p>
          <div className="flex flex-col gap-2.5">
            {([
              { label: 'Telefone',        value: lead.phone,        isSource: false },
              { label: 'Fonte',           value: lead.source,       isSource: true  },
              { label: 'Agente',          value: lead.agent.full_name, isSource: false },
              { label: 'Criada',          value: new Date(lead.created_at).toLocaleDateString('pt-PT'), isSource: false },
              { label: 'Último Contacto', value: lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString('pt-PT') : '—', isSource: false },
            ] as { label: string; value: string; isSource: boolean }[]).map(({ label, value, isSource }) => (
              <div key={label} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span className="text-xs" style={{ color: 'var(--t3)' }}>{label}</span>
                {isSource && PLATFORM_SOURCES.has(value) ? (
                  <div className="flex items-center gap-1.5">
                    <PlatformIcon platform={value} size={16} />
                    <span className="text-xs font-manrope font-600 capitalize" style={{ color: 'var(--t1)' }}>{value}</span>
                  </div>
                ) : (
                  <span className="text-xs font-manrope font-600" style={{ color: 'var(--t1)' }}>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="label-system mb-3">TIMELINE</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📞', text: 'Call realizada — avançou para proposta', time: '2h atrás', color: 'var(--success)' },
              { icon: '💬', text: 'WhatsApp enviado automaticamente', time: '1 dia', color: '#25D366' },
              { icon: '📥', text: 'Lead criada via Facebook Ads', time: '3 dias', color: '#1877F2' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: 'var(--s2)' }}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-manrope font-600 leading-snug" style={{ color: 'var(--t1)' }}>{item.text}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form answers indicator */}
        <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(33,160,196,0.06)', border: '1px solid rgba(33,160,196,0.15)' }}>
          <FileText size={14} style={{ color: 'var(--cyan)' }} />
          <p className="text-xs font-manrope flex-1" style={{ color: 'var(--t2)' }}>Formulário de qualificação preenchido</p>
          <ChevronRight size={12} style={{ color: 'var(--t3)' }} />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {[
          { icon: Phone, label: 'Ligar', color: 'var(--cyan)' },
          { icon: Calendar, label: 'Agendar', color: 'var(--success)' },
          { icon: MessageSquare, label: 'WhatsApp', color: '#25D366' },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl tonal-hover transition-all"
            style={{ background: 'var(--s2)' }}
          >
            <Icon size={16} style={{ color }} />
            <span className="label-system" style={{ fontSize: '0.58rem' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── import modal ─── */
function ImportModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setStep('preview') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-float)' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Importar Leads</p>
          <button onClick={onClose} className="tonal-hover p-1.5 rounded-lg" style={{ color: 'var(--t3)' }}>
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {step === 'upload' && (
            <>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all"
                style={{ borderColor: 'rgba(33,160,196,0.3)', background: 'rgba(33,160,196,0.04)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(33,160,196,0.1)' }}>
                  <Upload size={20} style={{ color: 'var(--cyan)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Arraste um ficheiro CSV ou clique</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Suporta .csv · máx 10 MB</p>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              <div className="rounded-xl p-3" style={{ background: 'var(--s2)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--t2)' }}>Colunas esperadas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['nome', 'email', 'telefone', 'fonte', 'score', 'temperatura'].map(c => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-lg font-mono" style={{ background: 'var(--s3)', color: 'var(--t3)' }}>{c}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'preview' && file && (
            <>
              <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--s2)' }}>
                <FileText size={16} style={{ color: 'var(--cyan)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Check size={16} style={{ color: 'var(--success)' }} />
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <table className="w-full text-[10px]">
                  <thead style={{ background: 'var(--s2)' }}>
                    <tr>
                      {['Nome', 'Email', 'Fonte', 'Score'].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-bold" style={{ color: 'var(--t3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Marta Alves', 'marta@email.com', 'facebook', '72'],
                      ['Paulo Gomes', 'paulo@email.com', 'google', '58'],
                      ['Ana Simões', 'ana@email.com', 'instagram', '81'],
                    ].map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2" style={{ color: 'var(--t2)' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--t3)' }}>Pré-visualização — 3 de 24 registos</p>
            </>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,229,160,0.1)' }}>
                <Check size={24} style={{ color: 'var(--success)' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>24 leads importadas com sucesso!</p>
              <p className="text-xs" style={{ color: 'var(--t3)' }}>Duplicados removidos · Score calculado automaticamente</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold tonal-hover" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
            {step === 'done' ? 'Fechar' : 'Cancelar'}
          </button>
          {step === 'preview' && (
            <button onClick={() => setStep('done')} className="flex-1 btn-lime py-2.5 rounded-xl text-sm">
              Importar 24 leads
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function exportCSV(leads: typeof MOCK_LEADS) {
  const headers = ['Nome', 'Email', 'Telefone', 'Fonte', 'Score', 'Temperatura', 'Estado', 'Agente', 'Criada']
  const rows = leads.map(l => [
    l.full_name, l.email, l.phone, l.source, l.score, l.temperature, l.status, l.agent.full_name,
    new Date(l.created_at).toLocaleDateString('pt-PT'),
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ─── main page ─── */
export default function ComercialPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tempFilter, setTempFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchFocus, setSearchFocus] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filtered = MOCK_LEADS.filter(l => {
    const matchSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || l.email.includes(search)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const matchTemp = tempFilter === 'all' || l.temperature === tempFilter
    return matchSearch && matchStatus && matchTemp
  })

  const hotCount = MOCK_LEADS.filter(l => l.temperature === 'hot').length
  const noContactCount = MOCK_LEADS.filter(l => !l.last_contact_at).length

  return (
    <>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    <div className="flex h-full gap-0 overflow-hidden animate-fade-in">
      {/* Main panel */}
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="label-system mb-1">CRM · {filtered.length} LEADS ACTIVAS</p>
            <h1 className="page-title">Comercial</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl tonal-hover transition-colors"
              style={{ background: 'var(--s1)', color: 'var(--t2)' }}
            >
              <Upload size={13} /> Importar
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl tonal-hover transition-colors"
              style={{ background: 'var(--s1)', color: 'var(--t2)' }}
            >
              <Download size={13} /> Exportar CSV
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="btn-lime flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl"
            >
              <Plus size={14} /> Nova Lead
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'TOTAL LEADS',    value: MOCK_LEADS.length,              delta: '+8', up: true,  color: 'var(--cyan)' },
            { label: 'HOT LEADS',      value: hotCount,                        delta: '+3', up: true,  color: '#E84545' },
            { label: 'SEM CONTACTO',   value: noContactCount,                  delta: '+2', up: false, color: '#F5A623' },
            { label: 'FECHADAS (MÊS)', value: MOCK_LEADS.filter(l => l.status === 'closed').length, delta: '+1', up: true, color: 'var(--success)' },
          ].map(({ label, value, delta, up, color }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center justify-between" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}>
              <div>
                <p className="label-system mb-1">{label}</p>
                <p className="metric-xl" style={{ fontSize: '2rem' }}>{value}</p>
              </div>
              <span
                className="flex items-center gap-1 text-xs font-manrope font-700 px-2 py-1 rounded-lg"
                style={{ background: up ? 'rgba(0,229,160,0.1)' : 'rgba(232,69,69,0.1)', color: up ? 'var(--success)' : 'var(--danger)' }}
              >
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {delta}
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 flex-1 max-w-xs transition-all"
            style={{
              background: 'var(--s1)',
              border: searchFocus ? '1px solid rgba(33,160,196,0.3)' : '1px solid transparent',
              boxShadow: searchFocus ? '0 0 0 3px rgba(33,160,196,0.1)' : 'none',
            }}
          >
            <Search size={14} style={{ color: searchFocus ? 'var(--cyan)' : 'var(--t3)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Pesquisar leads..."
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: 'var(--t1)', caretColor: 'var(--cyan)' }}
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl px-3 py-2.5 outline-none"
            style={{ background: 'var(--s1)', color: 'var(--t2)', border: '1px solid transparent' }}
          >
            <option value="all">Todos os estados</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Temp filter */}
          <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--s1)' }}>
            {(['all', 'hot', 'warm', 'cold'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTempFilter(t)}
                className="px-3 py-2.5 text-xs font-manrope font-600 transition-all"
                style={{
                  background: tempFilter === t ? 'var(--s3)' : 'transparent',
                  color: tempFilter === t
                    ? (t === 'hot' ? '#E84545' : t === 'warm' ? '#F5A623' : t === 'cold' ? '#3D5570' : 'var(--lime)')
                    : 'var(--t3)',
                }}
              >
                {t === 'all' ? 'Todos' : TEMP_CONFIG[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl flex-1 overflow-hidden" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}>
          <div className="overflow-auto h-full">
            <table className="w-full">
              <thead className="sticky top-0" style={{ background: 'var(--s1)' }}>
                <tr>
                  {['LEAD', 'CANAL', 'SCORE', 'TEMP', 'ESTADO', 'AGENTE', 'CONTACTO', ''].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 whitespace-nowrap label-system"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const temp = TEMP_CONFIG[lead.temperature]
                  const status = STATUS_CONFIG[lead.status]
                  const isSelected = selectedLead?.id === lead.id
                  const scoreColor = lead.score >= 80 ? 'var(--success)' : lead.score >= 50 ? '#F5A623' : 'var(--t3)'
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(isSelected ? null : lead)}
                      className="cursor-pointer transition-colors tonal-hover"
                      style={{
                        background: isSelected ? 'rgba(33,160,196,0.06)' : undefined,
                        borderLeft: isSelected ? '2px solid var(--cyan)' : '2px solid transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-manrope font-700 flex-shrink-0"
                            style={{ background: 'rgba(33,160,196,0.1)', color: 'var(--cyan)' }}
                          >
                            {lead.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-manrope font-600" style={{ color: 'var(--t1)' }}>{lead.full_name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {PLATFORM_SOURCES.has(lead.source) ? (
                          <PlatformIcon platform={lead.source} size={22} />
                        ) : (
                          <span className="text-[10px] font-manrope font-700 px-2 py-1 rounded-lg" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>
                            {SOURCE_LABELS[lead.source] ?? '?'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 rounded-full" style={{ background: 'var(--s3)' }}>
                            <div className="h-1 rounded-full" style={{ width: `${lead.score}%`, background: scoreColor }} />
                          </div>
                          <span className="text-xs font-manrope font-700" style={{ color: scoreColor }}>{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[9px] font-manrope font-700 px-2 py-1 rounded"
                          style={{ background: `${temp.color}18`, color: temp.color }}
                        >
                          {temp.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-manrope font-600" style={{ color: status?.color }}>{status?.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-manrope" style={{ color: 'var(--t2)' }}>{lead.agent.full_name}</td>
                      <td className="px-4 py-3 text-xs font-manrope" style={{ color: lead.last_contact_at ? 'var(--t3)' : 'var(--danger)' }}>
                        {lead.last_contact_at ? new Date(lead.last_contact_at).toLocaleDateString('pt-PT') : 'Sem contacto'}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} style={{ color: isSelected ? 'var(--cyan)' : 'var(--t3)' }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedLead && (
        <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
    </>
  )
}
