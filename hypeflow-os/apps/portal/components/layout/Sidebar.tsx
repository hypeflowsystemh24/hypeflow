'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, Users, Phone,
  Kanban, LogOut, ChevronRight, Zap,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard',      href: '/dashboard', icon: LayoutDashboard },
  { label: 'ROI & Métricas', href: '/roi',        icon: TrendingUp },
  { label: 'As Minhas Leads',href: '/leads',      icon: Users },
  { label: 'Calls',          href: '/calls',      icon: Phone },
  { label: 'Pipeline',       href: '/pipeline',   icon: Kanban },
]

const CLIENT = { name: 'TechnoSpark Lda', niche: 'SaaS B2B', initials: 'TS' }

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen border-r"
      style={{ background: 'var(--s1)', borderColor: 'var(--glass-border)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        {/* Lime logo mark */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 lime-pulse"
          style={{ background: 'var(--lime)' }}
        >
          <Zap size={16} style={{ color: '#0D1117' }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-syne)', color: 'var(--t1)' }}>
            HYPE FLOW
          </p>
          <p className="tag-label" style={{ fontSize: '0.6rem' }}>Portal do Cliente</p>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 px-5 py-2.5">
        <span
          className="w-1.5 h-1.5 rounded-full live-dot flex-shrink-0"
          style={{ background: 'var(--success)' }}
        />
        <span className="tag-label">Dados em tempo real</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative"
              style={{
                color: active ? 'var(--cyan)' : 'var(--t2)',
                background: active ? 'var(--cyan-glow)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--s3)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              {/* Active accent bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'var(--cyan)' }}
                />
              )}
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={11} style={{ opacity: 0.5 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Client card */}
      <div
        className="px-3 py-4 border-t flex flex-col gap-1"
        style={{ borderColor: 'var(--glass-border)' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: 'var(--cyan-glow)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: 'var(--cyan)', color: '#0D1117' }}
          >
            {CLIENT.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: 'var(--t1)' }}>{CLIENT.name}</p>
            <p className="tag-label" style={{ fontSize: '0.58rem' }}>{CLIENT.niche}</p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ color: 'var(--t3)' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--danger)'
            el.style.background = 'rgba(232,69,69,0.08)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--t3)'
            el.style.background = 'transparent'
          }}
        >
          <LogOut size={12} /> Sair
        </Link>
      </div>
    </aside>
  )
}
