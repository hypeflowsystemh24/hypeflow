'use client'

import { Bell, RefreshCw, ArrowUpRight, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const NOTIFICATIONS = [
  { id: 1, text: 'A sua call de amanhã está confirmada', time: '1h', href: '/client/calls' },
  { id: 2, text: 'Relatório de Março disponível', time: '3h', href: '/client/roi' },
  { id: 3, text: '3 novos leads esta semana', time: '1d', href: '/client/leads' },
]

export function ClientTopBar({ clientName }: { clientName: string }) {
  const [refreshing, setRefreshing] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const now = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b glass"
      style={{ borderColor: 'var(--glass-border)' }}
    >
      <div>
        <p className="text-xs capitalize" style={{ color: 'var(--t3)' }}>{now}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
          style={{ background: 'var(--s2)', color: 'var(--t2)', border: '1px solid var(--glass-border)' }}
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-xl transition-colors"
            style={{ color: 'var(--t2)', background: notifOpen ? 'var(--s2)' : 'transparent' }}
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full lime-pulse" style={{ background: 'var(--lime)' }} />
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--s2)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Notificações</p>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg tonal-hover" style={{ color: 'var(--t3)' }}>
                  <X size={12} />
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <a
                  key={n.id}
                  href={n.href}
                  onClick={() => setNotifOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 tonal-hover block"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', textDecoration: 'none' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--lime)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--t1)' }}>{n.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{n.time} atrás</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <a
          href="/client/roi"
          className="btn-lime flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ fontSize: '0.75rem' }}
        >
          Ver ROI <ArrowUpRight size={11} />
        </a>

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
