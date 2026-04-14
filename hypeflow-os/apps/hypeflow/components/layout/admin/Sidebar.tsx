'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, BarChart2,
  Phone, Settings, Zap, Building2, FileText, Activity,
  MessageSquare, Calendar, Mail, CreditCard, Star,
} from 'lucide-react'

type NavItem = { label: string; href: string; icon: React.ElementType; badge?: string; group?: string }

const nav: NavItem[] = [
  { label: 'Dashboard',   href: '/admin/dashboard',  icon: LayoutDashboard },

  { label: 'Contactos',   href: '/admin/contactos',  icon: Users,         group: 'CRM & Vendas' },
  { label: 'Pipeline',    href: '/admin/pipeline',   icon: Kanban,        group: 'CRM & Vendas' },
  { label: 'Conversas',   href: '/admin/conversas',  icon: MessageSquare, group: 'CRM & Vendas', badge: '6' },
  { label: 'Calendário',  href: '/admin/calendario', icon: Calendar,      group: 'CRM & Vendas' },
  { label: 'Calls',       href: '/admin/calls',      icon: Phone,         group: 'CRM & Vendas' },

  { label: 'Marketing',   href: '/admin/marketing',  icon: Mail,          group: 'Marketing' },
  { label: 'Automações',  href: '/admin/automacoes', icon: Zap,           group: 'Marketing' },
  { label: 'Formulários', href: '/admin/formularios',icon: FileText,      group: 'Marketing' },

  { label: 'Tráfego',     href: '/admin/trafego',    icon: BarChart2,     group: 'Negócio' },
  { label: 'Pagamentos',  href: '/admin/pagamentos',  icon: CreditCard,   group: 'Negócio' },
  { label: 'Reputação',   href: '/admin/reputacao',   icon: Star,         group: 'Negócio' },
  { label: 'Clientes',    href: '/admin/clientes',    icon: Building2,    group: 'Negócio' },

  { label: 'Config',      href: '/admin/config',     icon: Settings,      group: 'Sistema' },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen relative"
      style={{ background: 'var(--s0)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0">
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
        className="mx-3 mb-2 rounded-xl px-3 py-2 flex items-center gap-2.5 flex-shrink-0"
        style={{ background: 'var(--s1)' }}
      >
        <Activity size={12} style={{ color: 'var(--lime)' }} />
        <span className="text-xs font-semibold flex-1" style={{ color: 'var(--t2)' }}>Sistema</span>
        <span className="text-xs font-bold" style={{ color: 'var(--lime)' }}>LIVE</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 flex flex-col gap-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {nav.map(({ label, href, icon: Icon, badge, group }, i) => {
          const active = path === href || path.startsWith(href + '/')
          const prevGroup = i > 0 ? nav[i - 1]?.group : undefined
          const showGroupLabel = group !== undefined && group !== prevGroup

          return (
            <div key={href}>
              {showGroupLabel && (
                <p
                  className="text-[9px] uppercase tracking-widest px-3 pt-3 pb-1 font-bold"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                >
                  {group}
                </p>
              )}
              <Link
                href={href}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: active ? 'var(--s2)' : 'transparent',
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: 'var(--cyan)' }}
                  />
                )}
                <Icon size={14} style={{ color: active ? 'var(--cyan)' : 'var(--t3)' }} />
                <span className="text-sm font-medium flex-1" style={{ color: active ? 'var(--t1)' : 'var(--t2)' }}>
                  {label}
                </span>
                {badge && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: 'var(--cyan)', color: '#0D1117' }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 flex-shrink-0">
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
          <div className="w-2 h-2 rounded-full live-dot flex-shrink-0" style={{ background: 'var(--success)' }} />
        </div>
      </div>
    </aside>
  )
}
