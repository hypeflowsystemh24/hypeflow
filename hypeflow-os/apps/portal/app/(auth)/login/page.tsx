'use client'

import { useState } from 'react'
import { Fingerprint, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function PortalLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Preview: redirect directly
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#050D14] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#21A0C4] rounded-full opacity-[0.04] blur-[120px]" />
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#21A0C422] border border-[#21A0C430] flex items-center justify-center mb-4">
            <Fingerprint size={24} className="text-[#21A0C4]" />
          </div>
          <h1 className="text-2xl font-display font-800 text-white">Portal do Cliente</h1>
          <p className="text-sm text-[#7FA8C4] mt-1">HYPE Flow — Acesso exclusivo</p>
        </div>

        {/* Card */}
        <div className="bg-[#080F18] border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-700 text-[#3D6080] uppercase tracking-widest block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="o-seu@email.com"
                required
                className="w-full bg-[#0C1824] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4] transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-700 text-[#3D6080] uppercase tracking-widest block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0C1824] border border-white/5 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D6080] hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-[#E84545] bg-[#E8454510] border border-[#E8454530] rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#21A0C4] text-sm font-700 text-[#050D14] hover:bg-[#4FC8EA] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#050D14]/30 border-t-[#050D14] rounded-full animate-spin" />
              ) : (
                <>Entrar <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#3D6080] mt-6">
          Acesso fornecido pela sua agência HYPE Flow
        </p>
      </div>
    </div>
  )
}
