'use client'

import { useRouter } from 'next/navigation'
import {
  Send, Workflow, FileText, BarChart2,
  Play, Pause, Clock, CheckCircle, TrendingUp,
  ArrowRight, Plus,
} from 'lucide-react'

/* ─── sub-module cards ─── */

interface ModuleCard {
  id:          string
  href:        string
  icon:        React.ElementType
  title:       string
  description: string
  color:       string
  badge?:      string
}

const MODULES: ModuleCard[] = [
  {
    id: 'envios', href: '/admin/automacoes/disparos/envios',
    icon: Send, title: 'Envios', color: '#25D366',
    description: 'Disparos manuais e em massa por WhatsApp, email ou SMS.',
    badge: 'Beta',
  },
  {
    id: 'sequencias', href: '/admin/automacoes/disparos/sequencias',
    icon: Workflow, title: 'Sequências', color: '#D1FF00',
    description: 'Builder visual de automações com nodes drag-and-drop.',
  },
  {
    id: 'templates', href: '/admin/automacoes/disparos/templates',
    icon: FileText, title: 'Templates', color: '#21A0C4',
    description: 'Biblioteca de mensagens e templates reutilizáveis.',
  },
  {
    id: 'relatorios', href: '/admin/automacoes/disparos/relatorios',
    icon: BarChart2, title: 'Relatórios', color: '#F5A623',
    description: 'Métricas de entrega, abertura e conversão.',
  },
]

/* ─── stats mock ─── */

const STATS = [
  { label: 'Workflows activos', value: 5,    icon: Play,         color: 'var(--success)' },
  { label: 'Pausados',          value: 2,    icon: Pause,        color: 'var(--warning)'  },
  { label: 'Em rascunho',       value: 3,    icon: Clock,        color: 'var(--t3)'       },
  { label: 'Execuções hoje',    value: 142,  icon: CheckCircle,  color: 'var(--cyan)'     },
]

/* ─── recent workflows ─── */

const RECENT = [
  { id: 'wf-1', name: 'Boas-vindas WhatsApp',  status: 'active', runs: 342, rate: 87 },
  { id: 'wf-2', name: 'Nurturing Score Alto',  status: 'paused', runs: 118, rate: 72 },
  { id: 'wf-3', name: 'Re-activação 30 dias',  status: 'active', runs: 56,  rate: 61 },
]

const STATUS_DOT: Record<string, string> = {
  active: 'var(--success)',
  paused: 'var(--warning)',
  draft:  'var(--t3)',
}

/* ─── page ─── */

export default function DisparosPage() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto px-6 py-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Disparos & Automações</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Workflows, envios, templates e relatórios</p>
        </div>
        <button
          onClick={() => router.push('/admin/automacoes/disparos/sequencias')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: '#D1FF00', color: '#0D1117' }}
        >
          <Plus size={13} /> Novo workflow
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={14} style={{ color: s.color }} />
                <TrendingUp size={11} style={{ color: 'var(--t3)' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-2 gap-4">
        {MODULES.map(m => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              onClick={() => router.push(m.href)}
              className="text-left rounded-2xl p-5 tonal-hover transition-all group"
              style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)', border: `1px solid ${m.color}15` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${m.color}15` }}
                >
                  <Icon size={18} style={{ color: m.color }} />
                </div>
                <div className="flex items-center gap-2">
                  {m.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(245,166,35,0.15)', color: '#F5A623' }}>
                      {m.badge}
                    </span>
                  )}
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                    style={{ color: 'var(--t3)' }}
                  />
                </div>
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--t1)' }}>{m.title}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--t3)' }}>{m.description}</p>
            </button>
          )
        })}
      </div>

      {/* Recent workflows */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>Workflows recentes</p>
          <button
            onClick={() => router.push('/admin/automacoes/disparos/sequencias')}
            className="text-xs font-semibold tonal-hover px-2 py-1 rounded-lg"
            style={{ color: 'var(--cyan)' }}
          >
            Ver todos
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {RECENT.map(wf => (
            <button
              key={wf.id}
              onClick={() => router.push('/admin/automacoes/disparos/sequencias')}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl tonal-hover text-left"
              style={{ background: 'var(--s1)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[wf.status] }} />
              <p className="flex-1 text-sm font-semibold" style={{ color: 'var(--t1)' }}>{wf.name}</p>
              <span className="text-xs" style={{ color: 'var(--t3)' }}>{wf.runs} execuções</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${wf.rate}%`, background: 'var(--success)' }} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--success)' }}>{wf.rate}%</span>
              </div>
              <ArrowRight size={13} style={{ color: 'var(--t3)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
