'use client'

import { useState } from 'react'
import { CheckCircle, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

/* ─── mock form definitions ─── */
type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number'

interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface MockForm {
  id: string
  slug: string
  title: string
  description: string
  fields: FormField[]
  thankYou: string
  whatsappNotify: boolean
}

const MOCK_FORMS: Record<string, MockForm> = {
  'qualificacao-geral': {
    id: 'form-1',
    slug: 'qualificacao-geral',
    title: 'Qualificação de Lead',
    description: 'Preencha o formulário abaixo para que possamos entender melhor o seu negócio e como podemos ajudá-lo a crescer.',
    thankYou: 'Obrigado pelo seu interesse! A nossa equipa entrará em contacto em breve.',
    whatsappNotify: true,
    fields: [
      { id: 'f1', type: 'text',     label: 'Nome completo',           placeholder: 'João Silva',              required: true  },
      { id: 'f2', type: 'email',    label: 'Email profissional',      placeholder: 'joao@empresa.com',        required: true  },
      { id: 'f3', type: 'phone',    label: 'WhatsApp / Telefone',     placeholder: '+351 912 345 678',        required: true  },
      { id: 'f4', type: 'text',     label: 'Nome da empresa',         placeholder: 'TechCorp Lda',            required: true  },
      { id: 'f5', type: 'select',   label: 'Sector de actividade',    required: true,
        options: ['SaaS / Software', 'Saúde & Beleza', 'Imobiliário', 'E-commerce', 'Educação', 'Serviços B2B', 'Outro'] },
      { id: 'f6', type: 'textarea', label: 'Qual é o seu maior desafio de marketing actualmente?',
        placeholder: 'Ex: gerar leads qualificados, aumentar conversão...', required: true },
      { id: 'f7', type: 'select',   label: 'Orçamento mensal disponível para marketing', required: true,
        options: ['< €500', '€500 – €1.500', '€1.500 – €5.000', '€5.000 – €15.000', '> €15.000'] },
      { id: 'f8', type: 'radio',    label: 'Como nos encontrou?', required: false,
        options: ['Facebook / Instagram', 'Google', 'LinkedIn', 'Recomendação', 'Outro'] },
      { id: 'f9', type: 'textarea', label: 'Informação adicional (opcional)',
        placeholder: 'Qualquer detalhe extra que queira partilhar...', required: false },
    ],
  },
  'lead-fria-reactivacao': {
    id: 'form-2',
    slug: 'lead-fria-reactivacao',
    title: 'Reactivação de Lead',
    description: 'Ficamos sem contacto e gostaríamos de perceber onde estão as suas prioridades agora.',
    thankYou: 'Recebemos a sua resposta! Vamos preparar uma proposta personalizada.',
    whatsappNotify: true,
    fields: [
      { id: 'f1', type: 'text',  label: 'Nome',              placeholder: 'O seu nome', required: true },
      { id: 'f2', type: 'email', label: 'Email',             placeholder: 'email@empresa.com', required: true },
      { id: 'f3', type: 'phone', label: 'Telefone / WA',     placeholder: '+351 ...', required: true },
      { id: 'f4', type: 'radio', label: 'Continua a investir em marketing digital?', required: true,
        options: ['Sim, activamente', 'Sim, mas com orçamento reduzido', 'Não neste momento', 'Procurando alternativas'] },
      { id: 'f5', type: 'textarea', label: 'O que mudou desde a nossa última conversa?',
        placeholder: 'Contexto actual do negócio...', required: false },
    ],
  },
  'proposta-imobiliario': {
    id: 'form-3',
    slug: 'proposta-imobiliario',
    title: 'Proposta Imobiliário',
    description: 'Formulário especializado para agências e promotores imobiliários.',
    thankYou: 'Proposta a ser preparada! Entraremos em contacto em 24h.',
    whatsappNotify: true,
    fields: [
      { id: 'f1', type: 'text',   label: 'Nome / Agência',        placeholder: 'ERA Lisboa', required: true },
      { id: 'f2', type: 'email',  label: 'Email',                 placeholder: 'geral@era.pt', required: true },
      { id: 'f3', type: 'phone',  label: 'Contacto',              placeholder: '+351 ...', required: true },
      { id: 'f4', type: 'number', label: 'Nº de imóveis em carteira', placeholder: '50', required: true },
      { id: 'f5', type: 'select', label: 'Zona de actuação', required: true,
        options: ['Lisboa', 'Porto', 'Algarve', 'Centro', 'Norte', 'Alentejo', 'Ilhas'] },
      { id: 'f6', type: 'select', label: 'Tipo de imóveis', required: true,
        options: ['Residencial', 'Comercial', 'Ambos', 'Luxo / Premium'] },
      { id: 'f7', type: 'textarea', label: 'Objectivo principal da campanha',
        placeholder: 'Ex: gerar leads para imóveis de luxo acima de 500k...', required: true },
    ],
  },
}

/* ─── params type ─── */
interface PageProps {
  params: { slug: string }
}

/* ─── field renderer ─── */
function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const base = 'w-full bg-[#0D1B2A] border rounded-xl px-4 py-3 text-white text-sm placeholder-[#4A6C8C] outline-none transition-all'
  const normal = 'border-[#1A2E42] focus:border-[#21A0C4]'
  const errCls = 'border-[#E84545]'

  if (field.type === 'textarea') {
    return (
      <textarea
        rows={3}
        placeholder={field.placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${base} ${error ? errCls : normal} resize-none`}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${base} ${error ? errCls : normal} appearance-none cursor-pointer`}
      >
        <option value="">Selecionar...</option>
        {field.options?.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'radio') {
    return (
      <div className="flex flex-col gap-2">
        {field.options?.map(o => (
          <label key={o} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${value === o ? 'border-[#21A0C4] bg-[#21A0C4]' : 'border-[#1A2E42] group-hover:border-[#21A0C480]'}`}
              onClick={() => onChange(o)}
            >
              {value === o && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm text-[#B8D4E8]">{o}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
      placeholder={field.placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${base} ${error ? errCls : normal}`}
    />
  )
}

/* ─── main page ─── */
export default function PublicFormPage({ params }: PageProps) {
  const form = MOCK_FORMS[params.slug]
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--s0)' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--danger)' }} />
          <h1 className="display-title text-xl mb-2" style={{ color: 'var(--t1)' }}>Formulário não encontrado</h1>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>O link pode estar incorreto ou o formulário foi removido.</p>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    for (const field of form.fields) {
      if (field.required && !values[field.id]?.trim()) {
        errs[field.id] = 'Campo obrigatório'
      }
      if (field.type === 'email' && values[field.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.id] ?? '')) {
        errs[field.id] = 'Email inválido'
      }
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const firstErrId = Object.keys(errs)[0]
      if (firstErrId) document.getElementById(firstErrId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // In production: POST to /api/forms/[slug]/submit
      // await fetch(`/api/forms/${form.slug}/submit`, { method: 'POST', body: JSON.stringify({ formId: form.id, values }) })
      await new Promise(r => setTimeout(r, 1800)) // simulate API call
      setSubmitted(true)
    } catch {
      setSubmitError('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--s0)' }}>
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.3)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: 'var(--success)' }} />
          </div>
          <h1 className="display-title text-2xl mb-3" style={{ color: 'var(--t1)' }}>Enviado com sucesso!</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--t2)' }}>{form.thankYou}</p>
          {form.whatsappNotify && (
            <p className="mt-4 text-xs font-manrope" style={{ color: 'var(--cyan)' }}>
              📱 A nossa equipa recebeu uma notificação WhatsApp com os seus dados.
            </p>
          )}
        </div>
      </div>
    )
  }

  const progress = form.fields.filter(f => values[f.id]?.trim()).length
  const total = form.fields.filter(f => f.required).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--s0)' }}>
      {/* Header */}
      <div className="glass sticky top-0 z-10 px-4 py-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-manrope font-black" style={{ background: 'var(--lime)', color: 'var(--s0)' }}>HF</div>
            <span className="label-system">HYPE FLOW</span>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2.5">
            <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: 'var(--s2)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? Math.min((progress / total) * 100, 100) : 0}%`, background: 'var(--lime)' }}
              />
            </div>
            <span className="text-xs font-manrope" style={{ color: 'var(--t3)' }}>{Math.min(progress, total)}/{total}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{form.title}</h1>
          <p className="text-[#7FA8C4] text-sm leading-relaxed">{form.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {form.fields.map((field, idx) => (
            <div key={field.id} id={field.id} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#B8D4E8] flex items-center gap-1">
                <span className="text-[#21A0C4] text-xs w-5 flex-shrink-0">{idx + 1}.</span>
                {field.label}
                {field.required && <span className="text-[#E84545] ml-0.5">*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.id] ?? ''}
                onChange={v => {
                  setValues(prev => ({ ...prev, [field.id]: v }))
                  if (errors[field.id]) setErrors(prev => { const n = { ...prev }; delete n[field.id]; return n })
                }}
                error={errors[field.id]}
              />
              {errors[field.id] && (
                <p className="text-xs text-[#E84545] flex items-center gap-1">
                  <AlertCircle size={11} /> {errors[field.id]}
                </p>
              )}
            </div>
          ))}

          {submitError && (
            <div className="bg-[#E8454520] border border-[#E8454540] rounded-xl px-4 py-3 text-[#E84545] text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-lime flex items-center justify-center gap-2 w-full disabled:opacity-60 disabled:cursor-not-allowed py-4 rounded-xl text-sm mt-2"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> A enviar...</>
            ) : (
              <>Enviar formulário <ChevronRight size={16} /></>
            )}
          </button>

          <p className="text-center text-[#4A6C8C] text-xs">
            Os seus dados são tratados com total confidencialidade.
          </p>
        </form>
      </div>
    </div>
  )
}
