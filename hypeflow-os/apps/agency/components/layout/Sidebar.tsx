'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, BarChart2,
  Phone, Settings, Zap, Building2, FileText, Activity,
} from 'lucide-react'

const nav = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Comercial',   href: '/comercial',   icon: Users },
  { label: 'Pipeline',    href: '/pipeline',    icon: Kanban },
  { label: 'Tráfego',    href: '/trafego',     icon: BarChart2 },
  { label: 'Calls',       href: '/calls',       icon: Phone },
  { label: 'Automações',  href: '/automacoes',  icon: Zap },
  { label: 'Formulários', href: '/formularios', icon: FileText },
  { label: 'Clientes',    href: '/clientes',    icon: Building2 },
  { label: 'Config',      href: '/config',      icon: Settings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen relative"
      style={{ background: 'var(--s0)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--lime)', color: '#0F1318' }}
          >
            HF
          </div>
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full live-dot"
            style={{ background: 'var(--cyan)' }}
          />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight" style={{ color: 'var(--t1)' }}>HYPE FLOW</p>
          <p className="text-xs" style={{ color: 'var(--t3)' }}>Agency OS</p>
        </div>
      </div>

      {/* Live indicator */}
      <div
        className="mx-3 mb-3 rounded-xl px-3 py-2 flex items-center gap-2.5"
        style={{ background: 'var(--s1)' }}
      >
        <Activity size={12} style={{ color: 'var(--lime)' }} />
        <span className="text-xs font-semibold flex-1" style={{ color: 'var(--t2)' }}>Sistema</span>
        <span className="text-xs font-bold" style={{ color: 'var(--lime)' }}>LIVE</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
              style={{
                background: active ? 'var(--s2)' : 'transparent',
                color: active ? 'var(--t1)' : 'var(--t2)',
              }}
            >
              {/* Active accent bar */}
              {active && (
                <span
                  className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full"
                  style={{ background: 'var(--cyan)' }}
                />
              )}
              <Icon
                size={16}
                style={{ color: active ? 'var(--cyan)' : 'var(--t3)' }}
                className="group-hover:opacity-100 transition-opacity"
              />
              <span className="text-sm font-medium" style={{ color: active ? 'var(--t1)' : 'var(--t2)' }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Agency footer */}
      <div className="px-3 py-4">
        <div
          className="rounded-xl px-3 py-3 flex items-center gap-3"
          style={{ background: 'var(--s1)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(33,160,196,0.15)', color: 'var(--cyan)' }}
          >
            AG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--t1)' }}>HYPE Flow</p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>Plano Pro</p>
          </div>
          <div
            className="w-2 h-2 rounded-full live-dot flex-shrink-0"
            style={{ background: 'var(--success)' }}
          />
        </div>
      </div>
    </aside>
  )
}
