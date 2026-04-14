'use client'

import { useState } from 'react'
import {
  Euro, Plus, CreditCard, TrendingUp, Clock,
  CheckCircle2, XCircle, AlertCircle, Send,
  Download, Filter, Search, ExternalLink,
  Receipt, Package, RefreshCw, ArrowUpRight,
} from 'lucide-react'

/* ─── Types ─── */
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled'
type ProductType = 'one_time' | 'recurring'

interface Invoice {
  id: string
  number: string
  client: string
  description: string
  amount: number
  status: InvoiceStatus
  issuedAt: string
  dueAt: string
  paidAt?: string
}

interface Product {
  id: string
  name: string
  type: ProductType
  price: number
  currency: string
  billingPeriod?: string
  activeSubscriptions: number
  mrr: number
}

/* ─── Mock Data ─── */
const MOCK_INVOICES: Invoice[] = [
  { id: '1', number: 'INV-0042', client: 'TF Digital', description: 'Pacote Growth — Março 2024', amount: 1200, status: 'paid', issuedAt: '2024-03-01', dueAt: '2024-03-15', paidAt: '2024-03-10' },
  { id: '2', number: 'INV-0043', client: 'Ferreira & Co', description: 'Consultoria + Meta Ads — Março', amount: 2400, status: 'paid', issuedAt: '2024-03-05', dueAt: '2024-03-20', paidAt: '2024-03-18' },
  { id: '3', number: 'INV-0044', client: 'Santos Imob', description: 'Pacote Pro — Março 2024', amount: 800, status: 'overdue', issuedAt: '2024-03-01', dueAt: '2024-03-15' },
  { id: '4', number: 'INV-0045', client: 'RA Studio', description: 'Setup + Onboarding', amount: 450, status: 'pending', issuedAt: '2024-03-15', dueAt: '2024-03-30' },
  { id: '5', number: 'INV-0046', client: 'SL Ventures', description: 'Pacote Growth — Abril 2024', amount: 1200, status: 'draft', issuedAt: '2024-04-01', dueAt: '2024-04-15' },
  { id: '6', number: 'INV-0047', client: 'TF Digital', description: 'Pacote Growth — Abril 2024', amount: 1200, status: 'pending', issuedAt: '2024-04-01', dueAt: '2024-04-15' },
  { id: '7', number: 'INV-0048', client: 'Carlos Mendes', description: 'Consultoria Estratégica', amount: 3600, status: 'paid', issuedAt: '2024-03-20', dueAt: '2024-03-27', paidAt: '2024-03-25' },
]

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Pacote Starter', type: 'recurring', price: 600, currency: 'EUR', billingPeriod: 'month', activeSubscriptions: 8, mrr: 4800 },
  { id: '2', name: 'Pacote Growth', type: 'recurring', price: 1200, currency: 'EUR', billingPeriod: 'month', activeSubscriptions: 14, mrr: 16800 },
  { id: '3', name: 'Pacote Pro', type: 'recurring', price: 2400, currency: 'EUR', billingPeriod: 'month', activeSubscriptions: 5, mrr: 12000 },
  { id: '4', name: 'Setup & Onboarding', type: 'one_time', price: 450, currency: 'EUR', activeSubscriptions: 0, mrr: 0 },
  { id: '5', name: 'Consultoria (hora)', type: 'one_time', price: 150, currency: 'EUR', activeSubscriptions: 0, mrr: 0 },
]

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: 'var(--success)',
  pending: '#F5A623',
  overdue: 'var(--danger)',
  draft: 'var(--t3)',
  cancelled: 'var(--t3)',
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  overdue: 'Em atraso',
  draft: 'Rascunho',
  cancelled: 'Cancelado',
}

const STATUS_ICONS: Record<InvoiceStatus, React.ElementType> = {
  paid: CheckCircle2,
  pending: Clock,
  overdue: AlertCircle,
  draft: Receipt,
  cancelled: XCircle,
}

/* ─── Main Page ─── */
export default function PagamentosPage() {
  const [tab, setTab] = useState<'invoices' | 'products' | 'subscriptions'>('invoices')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_INVOICES.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (search && !inv.client.toLowerCase().includes(search.toLowerCase()) && !inv.number.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalMrr = MOCK_PRODUCTS.filter(p => p.type === 'recurring').reduce((s, p) => s + p.mrr, 0)
  const totalPaid = MOCK_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = MOCK_INVOICES.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const totalOverdue = MOCK_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Pagamentos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Faturas, produtos e subscrições</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
            <Package size={14} /> Novo Produto
          </button>
          <button className="btn-lime flex items-center gap-2 px-5 py-2.5 rounded-xl">
            <Plus size={15} /> Nova Fatura
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'MRR', value: `€${(totalMrr / 1000).toFixed(1)}k`, icon: TrendingUp, color: '#D1FF00', sub: 'receita mensal recorrente' },
          { label: 'Recebido (mês)', value: `€${totalPaid.toLocaleString('pt-PT')}`, icon: CheckCircle2, color: 'var(--success)', sub: 'março 2024' },
          { label: 'Por cobrar', value: `€${totalPending.toLocaleString('pt-PT')}`, icon: Clock, color: '#F5A623', sub: 'pendente + atraso' },
          { label: 'Em Atraso', value: `€${totalOverdue.toLocaleString('pt-PT')}`, icon: AlertCircle, color: 'var(--danger)', sub: `${MOCK_INVOICES.filter(i => i.status === 'overdue').length} fatura(s)` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--t2)' }}>{label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold font-display" style={{ color: 'var(--t1)' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-1 py-1 rounded-2xl w-fit" style={{ background: 'var(--s2)' }}>
        {(['invoices', 'products', 'subscriptions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: tab === t ? 'var(--s3)' : 'transparent', color: tab === t ? 'var(--t1)' : 'var(--t3)' }}>
            {t === 'invoices' ? 'Faturas' : t === 'products' ? 'Produtos' : 'Subscrições'}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar fatura ou cliente..." className="pl-8 pr-3 py-2 rounded-xl text-sm outline-none w-64" style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }} />
            </div>
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['all', 'paid', 'pending', 'overdue', 'draft'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: statusFilter === s ? 'var(--s3)' : 'transparent', color: statusFilter === s ? (s === 'all' ? 'var(--t1)' : STATUS_COLORS[s]) : 'var(--t3)' }}>
                  {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Fatura', 'Cliente', 'Estado', 'Emitida', 'Vencimento', 'Valor', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const StatusIcon = STATUS_ICONS[inv.status]
                  const color = STATUS_COLORS[inv.status]
                  return (
                    <tr key={inv.id} className="transition-all" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Receipt size={14} style={{ color: 'var(--t3)' }} />
                          <span className="text-sm font-mono font-semibold" style={{ color: 'var(--t1)' }}>{inv.number}</span>
                        </div>
                        <p className="text-xs mt-0.5 pl-5" style={{ color: 'var(--t3)' }}>{inv.description}</p>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--t2)' }}>{inv.client}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full" style={{ background: `${color}15`, color }}>
                          <StatusIcon size={11} />
                          {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--t3)' }}>{inv.issuedAt}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: inv.status === 'overdue' ? 'var(--danger)' : 'var(--t3)' }}>{inv.dueAt}</td>
                      <td className="px-4 py-3">
                        <p className="text-base font-bold" style={{ color: inv.status === 'paid' ? 'var(--success)' : 'var(--t1)' }}>
                          €{inv.amount.toLocaleString('pt-PT')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {inv.status === 'pending' || inv.status === 'overdue' ? (
                            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(33,160,196,0.12)', color: 'var(--cyan)' }}>
                              <Send size={11} /> Enviar
                            </button>
                          ) : null}
                          <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}><Download size={13} /></button>
                          <button className="p-1.5 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}><ExternalLink size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'products' && (
        <div className="grid grid-cols-3 gap-4">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--t1)' }}>{product.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-lg mt-1 inline-block" style={{ background: product.type === 'recurring' ? 'rgba(209,255,0,0.1)' : 'rgba(33,160,196,0.1)', color: product.type === 'recurring' ? '#D1FF00' : 'var(--cyan)' }}>
                    {product.type === 'recurring' ? `Mensal` : 'One-time'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold font-display" style={{ color: 'var(--t1)' }}>€{product.price}</p>
                  {product.billingPeriod && <p className="text-xs" style={{ color: 'var(--t3)' }}>/mês</p>}
                </div>
              </div>
              {product.type === 'recurring' && (
                <div className="px-4 py-3 rounded-xl" style={{ background: 'var(--s2)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--t3)' }}>Subscrições activas</p>
                      <p className="text-xl font-bold font-display" style={{ color: 'var(--t1)' }}>{product.activeSubscriptions}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--t3)' }}>MRR</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>€{product.mrr.toLocaleString('pt-PT')}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 py-2 rounded-xl text-xs" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>Editar</button>
                <button className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1" style={{ background: 'rgba(33,160,196,0.1)', color: 'var(--cyan)' }}>
                  <ExternalLink size={11} /> Link pagamento
                </button>
              </div>
            </div>
          ))}
          <div className="card p-5 flex flex-col items-center justify-center gap-2 cursor-pointer tonal-hover" style={{ border: '2px dashed rgba(255,255,255,0.08)', minHeight: '180px' }}>
            <Plus size={24} style={{ color: 'var(--t3)' }} />
            <p className="text-sm" style={{ color: 'var(--t3)' }}>Novo Produto</p>
          </div>
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className="flex flex-col gap-3">
          {MOCK_PRODUCTS.filter(p => p.type === 'recurring' && p.activeSubscriptions > 0).map(product => (
            <div key={product.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--t1)' }}>{product.name}</p>
                  <p className="text-sm" style={{ color: 'var(--t3)' }}>€{product.price}/mês · {product.activeSubscriptions} subscritores</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-display" style={{ color: 'var(--success)' }}>€{product.mrr.toLocaleString('pt-PT')}</p>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>MRR</p>
                </div>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--s2)' }}>
                <div className="h-2 rounded-full" style={{ width: `${Math.min((product.mrr / totalMrr) * 100, 100)}%`, background: 'var(--success)' }} />
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--t3)' }}>{((product.mrr / totalMrr) * 100).toFixed(0)}% do MRR total</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
