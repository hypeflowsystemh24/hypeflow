'use client'

import { Bell, RefreshCw, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

export function TopBar({ clientName }: { clientName: string }) {
  const [refreshing, setRefreshing] = useState(false)
  const now = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b glass"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div>
        <p className="text-xs capitalize" style={{ color: 'var(--t3)' }}>{now}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: 'var(--s2)',
            color: 'var(--t2)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <RefreshCw
            size={11}
            style={{ color: 'var(--t2)' }}
            className={refreshing ? 'animate-spin' : ''}
          />
          Actualizar
        </button>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl transition-colors"
          style={{ color: 'var(--t2)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--s2)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
          <Bell size={16} />
          {/* Lime pulse dot */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full lime-pulse"
            style={{ background: 'var(--lime)' }}
          />
        </button>

        {/* CTA — Ver relatório completo */}
        <a
          href="/roi"
          className="btn-lime flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ fontSize: '0.75rem' }}
        >
          Ver ROI <ArrowUpRight size={11} />
        </a>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold"
          style={{ background: 'var(--cyan)', color: '#0D1117' }}
        >
          {clientName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
