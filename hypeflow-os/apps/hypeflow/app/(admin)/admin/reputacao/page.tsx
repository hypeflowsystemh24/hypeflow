'use client'

import { useState } from 'react'
import {
  Star, Send, MessageSquare, TrendingUp, ThumbsUp,
  ThumbsDown, Plus, Search, Filter, ExternalLink,
  CheckCircle2, Clock, AlertCircle, RefreshCw,
  BarChart2, Globe,
} from 'lucide-react'

/* ─── Types ─── */
type ReviewPlatform = 'google' | 'facebook' | 'trustpilot'
type ReviewSentiment = 'positive' | 'neutral' | 'negative'
type ReviewStatus = 'responded' | 'pending' | 'ignored'

interface Review {
  id: string
  platform: ReviewPlatform
  author: string
  rating: number
  text: string
  date: string
  status: ReviewStatus
  sentiment: ReviewSentiment
  response?: string
}

/* ─── Mock Data ─── */
const MOCK_REVIEWS: Review[] = [
  { id: '1', platform: 'google', author: 'Ana Ferreira', rating: 5, text: 'Excelente trabalho! Os resultados das campanhas superaram as expectativas. MRR aumentou 40% em 3 meses.', date: '2024-03-10', status: 'responded', sentiment: 'positive', response: 'Obrigado Ana! Fico muito feliz com os resultados. Continuamos a trabalhar para superar as expectativas.' },
  { id: '2', platform: 'google', author: 'Carlos Mendes', rating: 5, text: 'Profissionalismo e resultados excelentes. Recomendo a qualquer empresa que queira crescer digitalmente.', date: '2024-03-08', status: 'responded', sentiment: 'positive' },
  { id: '3', platform: 'facebook', author: 'Sofia Lopes', rating: 4, text: 'Bom serviço em geral. A comunicação poderia ser mais proactiva. Os resultados das Meta Ads foram muito bons.', date: '2024-03-05', status: 'pending', sentiment: 'positive' },
  { id: '4', platform: 'google', author: 'Miguel Costa', rating: 3, text: 'Serviço razoável. Demorou algum tempo a ver resultados, mas no final melhorou. Resposta ao cliente pode melhorar.', date: '2024-02-28', status: 'pending', sentiment: 'neutral' },
  { id: '5', platform: 'trustpilot', author: 'João Santos', rating: 5, text: 'Fantástico! O pipeline de vendas ficou completamente optimizado. Leads muito mais qualificadas do que antes.', date: '2024-02-20', status: 'responded', sentiment: 'positive' },
  { id: '6', platform: 'google', author: 'Rita Alves', rating: 2, text: 'Esperava mais resultados no primeiro mês. A equipa foi simpática mas os entregáveis demoraram.', date: '2024-02-15', status: 'pending', sentiment: 'negative' },
  { id: '7', platform: 'facebook', author: 'Pedro Neves', rating: 5, text: 'Excelente equipa! Muito profissionais e orientados para resultados. Recomendo vivamente.', date: '2024-02-10', status: 'responded', sentiment: 'positive' },
]

const PLATFORM_COLORS: Record<ReviewPlatform, string> = {
  google: '#4285F4',
  facebook: '#1877F2',
  trustpilot: '#00B67A',
}

const PLATFORM_LABELS: Record<ReviewPlatform, string> = {
  google: 'Google',
  facebook: 'Facebook',
  trustpilot: 'Trustpilot',
}

const SENTIMENT_COLORS: Record<ReviewSentiment, string> = {
  positive: 'var(--success)',
  neutral: '#F5A623',
  negative: 'var(--danger)',
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} style={{ color: i <= rating ? '#F5A623' : 'rgba(255,255,255,0.1)', fill: i <= rating ? '#F5A623' : 'transparent' }} />
      ))}
    </div>
  )
}

export default function ReputacaoPage() {
  const [platform, setPlatform] = useState<ReviewPlatform | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState('')

  const filtered = MOCK_REVIEWS.filter(r => {
    if (platform !== 'all' && r.platform !== platform) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  const avgRating = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length
  const pendingCount = MOCK_REVIEWS.filter(r => r.status === 'pending').length
  const positiveRate = (MOCK_REVIEWS.filter(r => r.sentiment === 'positive').length / MOCK_REVIEWS.length * 100).toFixed(0)

  const byPlatform: Record<ReviewPlatform, { count: number; avg: number }> = {
    google: { count: 0, avg: 0 },
    facebook: { count: 0, avg: 0 },
    trustpilot: { count: 0, avg: 0 },
  }
  MOCK_REVIEWS.forEach(r => {
    byPlatform[r.platform].count++
    byPlatform[r.platform].avg += r.rating
  })
  Object.keys(byPlatform).forEach(p => {
    const k = p as ReviewPlatform
    if (byPlatform[k].count > 0) byPlatform[k].avg = byPlatform[k].avg / byPlatform[k].count
  })

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reputação</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Gestão de reviews e reputação online</p>
        </div>
        <button className="btn-lime flex items-center gap-2 px-5 py-2.5 rounded-xl">
          <Send size={15} /> Pedir Review
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Rating Médio', value: avgRating.toFixed(1), icon: Star, color: '#F5A623', sub: `${MOCK_REVIEWS.length} reviews` },
          { label: 'Positivos', value: `${positiveRate}%`, icon: ThumbsUp, color: 'var(--success)', sub: 'sentiment positivo' },
          { label: 'Por Responder', value: String(pendingCount), icon: Clock, color: '#F5A623', sub: 'requerem atenção' },
          { label: 'Este mês', value: '7', icon: TrendingUp, color: 'var(--cyan)', sub: 'novas reviews' },
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

      {/* Platform breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(byPlatform) as ReviewPlatform[]).map(p => (
          <div key={p} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${PLATFORM_COLORS[p]}15` }}>
              <Globe size={18} style={{ color: PLATFORM_COLORS[p] }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{PLATFORM_LABELS[p]}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={Math.round(byPlatform[p].avg)} size={11} />
                <span className="text-xs font-bold" style={{ color: '#F5A623' }}>{byPlatform[p].avg.toFixed(1)}</span>
                <span className="text-xs" style={{ color: 'var(--t3)' }}>· {byPlatform[p].count} reviews</span>
              </div>
            </div>
            <button className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: `${PLATFORM_COLORS[p]}15`, color: PLATFORM_COLORS[p] }}>
              Ver →
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Reviews list */}
        <div className="col-span-2 flex flex-col gap-3">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['all', 'google', 'facebook', 'trustpilot'] as const).map(p => (
                <button key={p} onClick={() => setPlatform(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: platform === p ? 'var(--s3)' : 'transparent', color: platform === p ? 'var(--t1)' : 'var(--t3)' }}>
                  {p === 'all' ? 'Todos' : PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 px-1 py-1 rounded-xl" style={{ background: 'var(--s2)' }}>
              {(['all', 'pending', 'responded'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: statusFilter === s ? 'var(--s3)' : 'transparent', color: statusFilter === s ? 'var(--t1)' : 'var(--t3)' }}>
                  {s === 'all' ? 'Todos' : s === 'pending' ? 'Por responder' : 'Respondidos'}
                </button>
              ))}
            </div>
          </div>

          {filtered.map(review => (
            <div
              key={review.id}
              className="card p-5 cursor-pointer tonal-hover transition-all"
              style={{ border: selectedReview?.id === review.id ? '1px solid rgba(33,160,196,0.3)' : '1px solid rgba(255,255,255,0.04)' }}
              onClick={() => { setSelectedReview(review); setResponseText('') }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                    {review.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--t1)' }}>{review.author}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${PLATFORM_COLORS[review.platform]}15`, color: PLATFORM_COLORS[review.platform] }}>
                        {PLATFORM_LABELS[review.platform]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: review.status === 'responded' ? 'rgba(0,229,160,0.1)' : 'rgba(245,166,35,0.1)', color: review.status === 'responded' ? 'var(--success)' : '#F5A623' }}>
                    {review.status === 'responded' ? 'Respondido' : 'Pendente'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--t3)' }}>{review.date}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>{review.text}</p>
              {review.response && (
                <div className="mt-3 pl-4 border-l-2" style={{ borderColor: 'var(--cyan)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cyan)' }}>Resposta da empresa</p>
                  <p className="text-sm" style={{ color: 'var(--t3)' }}>{review.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {selectedReview && selectedReview.status === 'pending' ? (
            <div className="card p-5 flex flex-col gap-4">
              <p className="font-semibold" style={{ color: 'var(--t1)' }}>Responder</p>
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={selectedReview.rating} />
                <span className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{selectedReview.author}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--t3)' }}>{selectedReview.text}</p>
              <textarea
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                placeholder={selectedReview.sentiment === 'negative'
                  ? 'Lamentamos a sua experiência. Vamos rectificar...'
                  : 'Obrigado pelo seu feedback! Fico muito satisfeito...'}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
              />
              <div className="flex flex-col gap-2">
                <button className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--cyan)', color: '#0D1117' }}>
                  <Send size={13} className="inline mr-1.5" />Publicar Resposta
                </button>
                <button className="w-full py-2 rounded-xl text-xs" style={{ background: 'var(--s2)', color: 'var(--t2)' }}>
                  ✨ Gerar com IA
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-5 flex flex-col gap-3">
              <p className="font-semibold" style={{ color: 'var(--t1)' }}>Pedir Review</p>
              <p className="text-sm" style={{ color: 'var(--t3)' }}>Enviar pedido automático de review após call ou fecho de negócio.</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Após call bem sucedida', auto: true },
                  { label: 'Após pagamento', auto: true },
                  { label: 'Após 30 dias cliente', auto: false },
                ].map(({ label, auto }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'var(--s2)' }}>
                    <p className="text-sm" style={{ color: 'var(--t2)' }}>{label}</p>
                    <div className="w-2 h-2 rounded-full" style={{ background: auto ? 'var(--success)' : 'var(--t3)' }} />
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold mt-1" style={{ background: 'rgba(209,255,0,0.1)', color: '#D1FF00' }}>
                Enviar Manualmente
              </button>
            </div>
          )}

          <div className="card p-5 flex flex-col gap-3">
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>Alertas de Reputação</p>
            {[
              { text: 'Review negativa (2 estrelas) — Rita Alves', urgent: true },
              { text: '3 reviews por responder', urgent: false },
            ].map(({ text, urgent }, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: urgent ? 'rgba(232,69,69,0.06)' : 'var(--s2)' }}>
                <AlertCircle size={13} style={{ color: urgent ? 'var(--danger)' : '#F5A623', flexShrink: 0, marginTop: 1 }} />
                <p className="text-sm" style={{ color: 'var(--t2)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
