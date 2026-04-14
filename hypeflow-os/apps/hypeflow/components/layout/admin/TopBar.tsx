'use client'

import { Bell, Search, Zap, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const ALERTS = [
  { id: 1, text: 'João Silva aguarda resposta há 2h', time: '2m', href: '/admin/comercial' },
  { id: 2, text: 'Call com Carlos Mendes em 15 min', time: '14m', href: '/admin/calls' },
  { id: 3, text: 'Nova resposta no formulário de qualificação', time: '1h', href: '/admin/formularios' },
]

export function AdminTopBar({ user }: { user: User }) {
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'HF'
  const router = useRouter()
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocus, setSearchFocus] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 sticky top-0 z-30 glass">
      {/* Search */}
      <div
        className="flex items-center gap-2.5 rounded-xl px-4 py-2 w-72 transition-all"
        style={{
          background: searchFocus ? 'var(--s2)' : 'var(--s1)',
          outline: searchFocus ? '1px solid var(--cyan-border)' : '1px solid transparent',
        }}
      >
        <Search size={14} style={{ color: searchFocus ? 'var(--cyan)' : 'var(--t3)' }} />
        <input
          type="text"
          placeholder="Pesquisar leads, calls, clientes..."
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--t1)' }}
        />
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--s3)', color: 'var(--t3)' }}>⌘K</span>
      </div>

      {/* Center status */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: 'var(--success)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>Sistema operacional</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/admin/calls')}
          className="btn-lime hidden md:flex items-center gap-2 px-4 py-2 rounded-xl"
        >
          <Zap size={13} /> Nova Call
        </button>

        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(o => !o)}
            className="relative p-2 rounded-xl tonal-hover"
            style={{ color: 'var(--t2)' }}
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full lime-pulse" style={{ background: 'var(--lime)' }} />
          </button>
          {alertsOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--s2)', boxShadow: 'var(--shadow-float)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>Alertas</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--lime-muted)', color: 'var(--lime)' }}>
                  {ALERTS.length}
                </span>
              </div>
              {ALERTS.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => { setAlertsOpen(false); router.push(alert.href) }}
                  className="flex items-start gap-3 px-4 py-3 tonal-hover cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 live-dot" style={{ background: 'var(--cyan)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--t1)' }}>{alert.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{alert.time} atrás</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl tonal-hover"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--cyan)', color: '#0F1318' }}
            >
              {initials}
            </div>
            <ChevronDown size={12} style={{ color: 'var(--t3)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
              style={{ background: 'var(--s2)', boxShadow: 'var(--shadow-float)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{user.email}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Administrador</p>
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); router.push('/admin/config') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 tonal-hover text-sm"
                style={{ color: 'var(--t2)' }}
              >
                <Settings size={14} /> Configurações
              </button>
              <button
                onClick={() => { setUserMenuOpen(false); router.push('/admin/perfil') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 tonal-hover text-sm"
                style={{ color: 'var(--t2)' }}
              >
                <UserIcon size={14} /> Perfil
              </button>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={async () => {
                    const { createClient } = await import('@/lib/supabase/client')
                    await createClient().auth.signOut()
                    router.push('/login')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 tonal-hover text-sm"
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut size={14} /> Terminar sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
