'use client'

import { useState } from 'react'
import { Trophy, Star, Zap, Target, TrendingUp, Award, Flame, Clock, Users, ChevronRight } from 'lucide-react'

/* ─── Types ─── */
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earned: boolean
  earned_at?: string
  trigger: string
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: 'sdr' | 'closer' | 'gestor'
  level: string
  level_num: number
  xp: number
  xp_next: number
  deals_closed: number
  revenue: number
  show_up_rate: number
  tfc_avg: number
  score_avg: number
  badges: string[]   // badge ids
  rank_week: number
  rank_month: number
}

/* ─── Badge definitions ─── */
const ALL_BADGES: Badge[] = [
  { id: 'b_first_deal',    name: 'Primeiro Deal',       description: 'Fecha o primeiro deal',                               icon: '🌟', color: '#FFD700', earned: true,  earned_at: '2026-01-15', trigger: '1 deal fechado' },
  { id: 'b_5_month',       name: '5 no Mês',            description: '5 deals fechados no mesmo mês',                       icon: '🔥', color: '#FF6B35', earned: true,  earned_at: '2026-02-28', trigger: '5 deals/mês' },
  { id: 'b_show_up',       name: 'Show-up Perfeito',    description: '100% de show-up numa semana (mín. 5 calls)',          icon: '💯', color: '#00E5A0', earned: true,  earned_at: '2026-03-10', trigger: '100% show-up/semana' },
  { id: 'b_lightning',     name: 'Velocidade Relâmpago', description: 'TFC < 2 min em 5 leads consecutivos',               icon: '⚡', color: '#D1FF00', earned: false, trigger: 'TFC < 2min × 5' },
  { id: 'b_full_pipeline', name: 'Pipeline Cheio',      description: '> 10 deals activos em simultâneo',                   icon: '📈', color: '#21A0C4', earned: true,  earned_at: '2026-03-20', trigger: '10 deals activos' },
  { id: 'b_perfect_nps',   name: 'Nota Perfeita',       description: 'NPS de cliente > 9 após mês de trabalho',            icon: '🏆', color: '#9B59B6', earned: false, trigger: 'NPS > 9' },
  { id: 'b_reactivator',   name: 'Reactivador',         description: 'Fecha deal de lead cold há > 30 dias',               icon: '♻️', color: '#F5A623', earned: false, trigger: 'Cold lead → Deal > 30d' },
  { id: 'b_streak',        name: 'Sequência Perfeita',  description: '3 semanas consecutivas batendo meta',                icon: '🎯', color: '#E84545', earned: false, trigger: '3 semanas × meta' },
]

/* ─── Level definitions ─── */
const LEVELS = [
  { num: 1, name: 'Trainee',       color: '#7FA8C4', min_deals: 0,  req: '< 5 deals fechados' },
  { num: 2, name: 'SDR Júnior',    color: '#21A0C4', min_deals: 5,  req: '5+ deals | TFC médio < 10min' },
  { num: 3, name: 'Closer',        color: '#00E5A0', min_deals: 15, req: '15+ deals | Conversão call > 30%' },
  { num: 4, name: 'Senior Closer', color: '#D1FF00', min_deals: 30, req: '30+ deals | Revenue > €50k' },
  { num: 5, name: 'Ace',           color: '#FFD700', min_deals: 50, req: '50+ deals | Revenue > €150k | NPS > 8.5' },
]

/* ─── Mock team data ─── */
const MOCK_TEAM: TeamMember[] = [
  {
    id: 'u1', name: 'João Ferreira', avatar: 'J', role: 'closer',
    level: 'Senior Closer', level_num: 4, xp: 8400, xp_next: 10000,
    deals_closed: 34, revenue: 72000, show_up_rate: 94, tfc_avg: 5.2, score_avg: 78,
    badges: ['b_first_deal', 'b_5_month', 'b_show_up', 'b_full_pipeline'],
    rank_week: 1, rank_month: 1,
  },
  {
    id: 'u2', name: 'Ana Costa', avatar: 'A', role: 'closer',
    level: 'Closer', level_num: 3, xp: 5200, xp_next: 7500,
    deals_closed: 22, revenue: 41000, show_up_rate: 88, tfc_avg: 7.8, score_avg: 71,
    badges: ['b_first_deal', 'b_5_month', 'b_show_up'],
    rank_week: 2, rank_month: 2,
  },
  {
    id: 'u3', name: 'Miguel Santos', avatar: 'M', role: 'sdr',
    level: 'SDR Júnior', level_num: 2, xp: 2100, xp_next: 4000,
    deals_closed: 8, revenue: 14500, show_up_rate: 82, tfc_avg: 9.1, score_avg: 65,
    badges: ['b_first_deal', 'b_5_month'],
    rank_week: 3, rank_month: 4,
  },
  {
    id: 'u4', name: 'Sofia Lima', avatar: 'S', role: 'sdr',
    level: 'SDR Júnior', level_num: 2, xp: 1800, xp_next: 4000,
    deals_closed: 6, revenue: 11200, show_up_rate: 79, tfc_avg: 11.3, score_avg: 61,
    badges: ['b_first_deal'],
    rank_week: 4, rank_month: 3,
  },
]

/* ─── Sub-components ─── */

function BadgeCard({ badge, size = 'md' }: { badge: Badge; size?: 'sm' | 'md' }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
      style={{
        background: badge.earned ? `${badge.color}12` : 'var(--s2)',
        border: badge.earned ? `1px solid ${badge.color}30` : '1px solid rgba(255,255,255,0.05)',
        opacity: badge.earned ? 1 : 0.45,
        filter: badge.earned ? 'none' : 'grayscale(1)',
      }}
      title={badge.description}
    >
      <span className={size === 'sm' ? 'text-xl' : 'text-3xl'}>{badge.icon}</span>
      <p className="text-[10px] font-bold text-center leading-tight" style={{ color: badge.earned ? badge.color : 'var(--t3)' }}>
        {badge.name}
      </p>
      {size === 'md' && (
        <p className="text-[9px] text-center leading-tight" style={{ color: 'var(--t3)' }}>{badge.description}</p>
      )}
    </div>
  )
}

function LevelBadge({ level_num }: { level_num: number }) {
  const lvl = LEVELS[level_num - 1] ?? LEVELS[0]!
  return (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${lvl.color}18`, color: lvl.color }}>
      {lvl.name}
    </span>
  )
}

function XpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: 'var(--t3)' }}>{current.toLocaleString()} / {max.toLocaleString()} XP</span>
    </div>
  )
}

const LEADERBOARD_METRICS = [
  { id: 'deals',     label: 'Deals Fechados',  key: 'deals_closed',  format: (v: number) => String(v),        color: '#00E5A0' },
  { id: 'revenue',   label: 'Revenue',          key: 'revenue',        format: (v: number) => `€${(v/1000).toFixed(0)}k`, color: '#21A0C4' },
  { id: 'show_up',   label: 'Show-up Rate',      key: 'show_up_rate',  format: (v: number) => `${v}%`,         color: '#D1FF00' },
  { id: 'tfc',       label: 'TFC Médio',         key: 'tfc_avg',       format: (v: number) => `${v}m`,         color: '#F5A623', asc: true },
] as const

/* ─── Main page ─── */
export default function GamificacaoPage() {
  const [tab, setTab] = useState<'leaderboard' | 'badges' | 'levels' | 'my'>('leaderboard')
  const [leaderMetric, setLeaderMetric] = useState<typeof LEADERBOARD_METRICS[number]['id']>('deals')
  const [period, setPeriod] = useState<'week' | 'month'>('month')

  const metric = LEADERBOARD_METRICS.find(m => m.id === leaderMetric) ?? LEADERBOARD_METRICS[0]!
  const sorted = [...MOCK_TEAM].sort((a, b) => {
    const va = a[metric.key as keyof TeamMember] as number
    const vb = b[metric.key as keyof TeamMember] as number
    return 'asc' in metric && metric.asc ? va - vb : vb - va
  })

  const me = MOCK_TEAM[0]!  // in production: current user

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="tag-label mb-1">EQUIPA · GAMIFICAÇÃO</p>
          <h1 className="page-title">Performance & Conquistas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--t2)' }}>Badges, níveis e ranking da equipa comercial</p>
        </div>
        <div className="flex items-center gap-2 px-1 py-1 rounded-xl" style={{ background: 'var(--s1)' }}>
          {(['week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: period === p ? 'var(--s3)' : 'transparent', color: period === p ? 'var(--t1)' : 'var(--t3)' }}
            >
              {p === 'week' ? 'Esta semana' : 'Este mês'}
            </button>
          ))}
        </div>
      </div>

      {/* My widget — always visible */}
      <div
        className="rounded-2xl p-4 flex items-center gap-5"
        style={{ background: 'var(--s1)', border: `1px solid ${LEVELS[me.level_num - 1]?.color ?? '#21A0C4'}25` }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
          style={{ background: `${LEVELS[me.level_num - 1]?.color ?? '#21A0C4'}18`, color: LEVELS[me.level_num - 1]?.color ?? '#21A0C4' }}
        >
          {me.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>{me.name}</p>
            <LevelBadge level_num={me.level_num} />
          </div>
          <XpBar current={me.xp} max={me.xp_next} color={LEVELS[me.level_num - 1]?.color ?? '#21A0C4'} />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#00E5A0' }}>{me.deals_closed}</p>
            <p className="text-[10px]" style={{ color: 'var(--t3)' }}>Deals</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#D1FF00' }}>#{period === 'week' ? me.rank_week : me.rank_month}</p>
            <p className="text-[10px]" style={{ color: 'var(--t3)' }}>Rank</p>
          </div>
          <div className="flex gap-1">
            {me.badges.slice(0, 4).map(bid => {
              const b = ALL_BADGES.find(ab => ab.id === bid)
              return b ? <span key={bid} title={b.name} className="text-xl">{b.icon}</span> : null
            })}
            {me.badges.length > 4 && (
              <span className="text-xs font-bold" style={{ color: 'var(--t3)' }}>+{me.badges.length - 4}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 p-1 rounded-xl w-fit" style={{ background: 'var(--s1)' }}>
        {([
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'badges',      label: 'Badges',      icon: Award },
          { id: 'levels',      label: 'Níveis',      icon: Star },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: tab === id ? 'var(--s3)' : 'transparent', color: tab === id ? 'var(--t1)' : 'var(--t3)' }}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="flex flex-col gap-4">
          {/* Metric selector */}
          <div className="flex gap-2 flex-wrap">
            {LEADERBOARD_METRICS.map(m => (
              <button
                key={m.id}
                onClick={() => setLeaderMetric(m.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: leaderMetric === m.id ? `${m.color}18` : 'var(--s1)',
                  color: leaderMetric === m.id ? m.color : 'var(--t3)',
                  border: leaderMetric === m.id ? `1px solid ${m.color}35` : '1px solid transparent',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {sorted.map((member, i) => {
              const val    = member[metric.key as keyof TeamMember] as number
              const maxVal = sorted[0] ? (sorted[0][metric.key as keyof TeamMember] as number) : 1
              const pct    = metric.id === 'tfc' ? (1 - val / (maxVal || 1)) * 100 : (val / (maxVal || 1)) * 100
              const medal  = ['🥇', '🥈', '🥉'][i]

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{ background: i === 0 ? `${metric.color}10` : 'var(--s1)', border: i === 0 ? `1px solid ${metric.color}25` : '1px solid transparent' }}
                >
                  <span className="text-xl w-8 text-center">{medal ?? `#${i + 1}`}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{member.name}</p>
                      <LevelBadge level_num={member.level_num} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--s3)', maxWidth: 200 }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: metric.color }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: metric.color }}>
                        {metric.format(val)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {member.badges.slice(0, 3).map(bid => {
                      const b = ALL_BADGES.find(ab => ab.id === bid)
                      return b ? <span key={bid} title={b.name} className="text-base">{b.icon}</span> : null
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badges grid */}
      {tab === 'badges' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--success)' }}>
                {ALL_BADGES.filter(b => b.earned).length} conquistados
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'var(--s2)', color: 'var(--t3)' }}>
                {ALL_BADGES.filter(b => !b.earned).length} por conquistar
              </span>
            </div>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {ALL_BADGES.map(b => <BadgeCard key={b.id} badge={b} />)}
          </div>
        </div>
      )}

      {/* Levels */}
      {tab === 'levels' && (
        <div className="flex flex-col gap-3">
          {LEVELS.map((lvl, i) => {
            const isActive = me.level_num === lvl.num
            const isDone   = me.level_num > lvl.num
            return (
              <div
                key={lvl.num}
                className="flex items-center gap-5 p-5 rounded-2xl transition-all"
                style={{
                  background: isActive ? `${lvl.color}12` : 'var(--s1)',
                  border: isActive ? `1px solid ${lvl.color}30` : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${lvl.color}18` }}
                >
                  {['🌱', '⚡', '🎯', '🔥', '👑'][i]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm" style={{ color: lvl.color }}>{lvl.name}</p>
                    {isActive && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${lvl.color}20`, color: lvl.color }}>
                        Nível actual
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,160,0.1)', color: 'var(--success)' }}>
                        ✓ Concluído
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--t3)' }}>{lvl.req}</p>
                </div>
                <ChevronRight size={16} style={{ color: isActive ? lvl.color : 'var(--t3)' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
