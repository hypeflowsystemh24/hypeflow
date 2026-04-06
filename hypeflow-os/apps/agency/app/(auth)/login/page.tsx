'use client'

import { useState } from 'react'
import { Fingerprint, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
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

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou password incorrectos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#050D14] flex items-center justify-center p-6"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(33,160,196,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(33,160,196,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Fingerprint size={36} className="text-[#21A0C4]" />
          <span className="font-display font-800 text-2xl text-white tracking-tight">HYPE FLOW OS</span>
        </div>

        {/* Card */}
        <div className="bg-[#0C1824] border border-white/8 rounded-2xl p-8">
          <h1 className="text-xl font-display font-800 text-white mb-1">Entrar na plataforma</h1>
          <p className="text-sm text-[#7FA8C4] mb-8">Acesso exclusivo à equipa HYPE Flow</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-700 text-[#7FA8C4] uppercase tracking-widest mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@hypeflow.pt"
                required
                className="w-full bg-[#050D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-700 text-[#7FA8C4] uppercase tracking-widest mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#050D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D6080] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-[#E8454511] border border-[#E84545] rounded-xl px-4 py-3 text-sm text-[#E84545]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#21A0C4] hover:bg-[#4FC8EA] text-[#050D14] font-800 text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'A entrar...' : 'Entrar'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#3D6080] mt-6">
          © 2026 HYPE Flow · Engenharia de Performance B2B
        </p>
      </div>
    </div>
  )
}
