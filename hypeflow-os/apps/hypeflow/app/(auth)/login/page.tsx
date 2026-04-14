'use client'

import { useState } from 'react'
import { Zap, ArrowRight, Eye, EyeOff, Shield, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AccessMode = 'admin' | 'client'

export default function LoginPage() {
  const [mode, setMode] = useState<AccessMode>('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) {
      setError('Email ou password incorrectos.')
      setLoading(false)
      return
    }

    // Detect user type from database and redirect accordingly
    const { data: agencyUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .single()

    if (agencyUser) {
      router.push('/admin/dashboard')
    } else {
      router.push('/client/dashboard')
    }
  }

  const isAdmin = mode === 'admin'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'var(--s0)',
        backgroundImage: 'linear-gradient(to right, rgba(33,160,196,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(33,160,196,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center lime-pulse"
            style={{ background: 'var(--lime)' }}
          >
            <Zap size={20} style={{ color: '#0F1318' }} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-lg tracking-tight leading-tight" style={{ color: 'var(--t1)', fontFamily: 'var(--font-syne)' }}>
              HYPE FLOW OS
            </p>
            <p className="text-xs" style={{ color: 'var(--t3)' }}>Engenharia de Performance B2B</p>
          </div>
        </div>

        {/* Access mode selector */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: 'var(--s1)', border: '1px solid var(--glass-border)' }}
        >
          <button
            onClick={() => { setMode('admin'); setError(null) }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: isAdmin ? 'var(--s3)' : 'transparent',
              color: isAdmin ? 'var(--t1)' : 'var(--t3)',
            }}
          >
            <Shield size={14} style={{ color: isAdmin ? 'var(--cyan)' : 'var(--t3)' }} />
            Administrador
          </button>
          <button
            onClick={() => { setMode('client'); setError(null) }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: !isAdmin ? 'var(--s3)' : 'transparent',
              color: !isAdmin ? 'var(--t1)' : 'var(--t3)',
            }}
          >
            <Building2 size={14} style={{ color: !isAdmin ? 'var(--lime)' : 'var(--t3)' }} />
            Cliente
          </button>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--s1)', border: '1px solid var(--glass-border)' }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-syne)', color: 'var(--t1)' }}>
            {isAdmin ? 'Acesso à Plataforma' : 'Portal do Cliente'}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--t2)' }}>
            {isAdmin
              ? 'Área operacional exclusiva da equipa HYPE Flow'
              : 'Acompanhe os resultados da sua campanha em tempo real'}
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAdmin ? 'admin@hypeflow.pt' : 'cliente@empresa.pt'}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--s0)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--t1)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--cyan)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'var(--t3)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--s0)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--t1)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--cyan)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--t3)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--t1)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--t3)')}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(232,69,69,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all mt-2 disabled:opacity-50"
              style={{
                background: isAdmin ? 'var(--cyan)' : 'var(--lime)',
                color: isAdmin ? '#0F1318' : '#0F1318',
                boxShadow: isAdmin
                  ? '0 0 24px rgba(33,160,196,0.25)'
                  : '0 0 24px rgba(209,255,0,0.2)',
              }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--t3)' }}>
          © 2026 HYPE Flow · Engenharia de Performance B2B
        </p>
      </div>
    </div>
  )
}
