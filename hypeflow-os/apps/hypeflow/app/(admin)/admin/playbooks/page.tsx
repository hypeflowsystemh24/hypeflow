'use client'

import { useState }         from 'react'
import { BookOpen, Check, Users, Plus, Search, Star } from 'lucide-react'

import { PlaybookCard }   from './components/PlaybookCard'
import { PlaybookDrawer } from './components/PlaybookDrawer'
import { Playbook, PlaybookCategory, PlaybookStatus, CATEGORY_CFG, MOCK_PLAYBOOKS } from './components/types'

export default function PlaybooksPage() {
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState<PlaybookCategory | 'all'>('all')
  const [selected, setSelected]   = useState<Playbook | null>(null)
  const [playbooks, setPlaybooks] = useState<Playbook[]>(MOCK_PLAYBOOKS)

  const activatePlaybook = (id: string) =>
    setPlaybooks(prev => prev.map(pb => pb.id === id ? { ...pb, status: 'active' as PlaybookStatus } : pb))

  const filtered = playbooks.filter(pb => {
    const matchSearch = !search || pb.name.toLowerCase().includes(search.toLowerCase()) || pb.description.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'all' || pb.category === catFilter
    return matchSearch && matchCat
  })

  const featured = filtered.filter(pb => pb.featured)
  const rest     = filtered.filter(pb => !pb.featured)

  const totalActive   = playbooks.filter(pb => pb.status === 'active').length
  const totalEnrolled = playbooks.reduce((s, pb) => s + pb.leads_enrolled, 0)

  return (
    <div className="flex h-full overflow-hidden animate-fade-in">
      <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 flex-shrink-0">
          <div>
            <h1 className="page-title">Playbooks</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>Sequências de venda prontas a activar</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)' }}>
              <Check size={11} style={{ color: 'var(--success)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>{totalActive} activos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Users size={11} style={{ color: 'var(--cyan)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--cyan)' }}>{totalEnrolled} leads</span>
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'var(--cyan)', color: '#0D1117' }}
            >
              <Plus size={12} />
              Novo playbook
            </button>
          </div>
        </div>

        {/* Search + category filter */}
        <div className="flex items-center gap-3 px-6 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
            <input
              type="text"
              placeholder="Pesquisar playbooks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: 'var(--s1)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCatFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: catFilter === 'all' ? 'rgba(33,160,196,0.15)' : 'var(--s1)',
                color:      catFilter === 'all' ? 'var(--cyan)' : 'var(--t3)',
                border:     `1px solid ${catFilter === 'all' ? 'rgba(33,160,196,0.3)' : 'transparent'}`,
              }}
            >
              Todos
            </button>
            {(Object.entries(CATEGORY_CFG) as [PlaybookCategory, (typeof CATEGORY_CFG)[PlaybookCategory]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setCatFilter(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: catFilter === key ? `${cfg.color}18` : 'var(--s1)',
                  color:      catFilter === key ? cfg.color : 'var(--t3)',
                  border:     `1px solid ${catFilter === key ? `${cfg.color}40` : 'transparent'}`,
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-6">
          {/* Featured */}
          {featured.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={12} style={{ color: '#D1FF00' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>Destaque</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {featured.map(pb => (
                  <PlaybookCard
                    key={pb.id}
                    pb={pb}
                    selected={selected?.id === pb.id}
                    onClick={() => setSelected(selected?.id === pb.id ? null : pb)}
                    onActivate={activatePlaybook}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Biblioteca */}
          {rest.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--t3)' }}>Biblioteca</p>
              <div className="grid grid-cols-2 gap-4">
                {rest.map(pb => (
                  <PlaybookCard
                    key={pb.id}
                    pb={pb}
                    selected={selected?.id === pb.id}
                    onClick={() => setSelected(selected?.id === pb.id ? null : pb)}
                    onActivate={activatePlaybook}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <BookOpen size={32} style={{ color: 'var(--t3)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--t3)' }}>Nenhum playbook encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <PlaybookDrawer
          pb={selected}
          onClose={() => setSelected(null)}
          onActivate={id => {
            activatePlaybook(id)
            setSelected(prev => prev ? { ...prev, status: 'active' } : null)
          }}
        />
      )}
    </div>
  )
}
