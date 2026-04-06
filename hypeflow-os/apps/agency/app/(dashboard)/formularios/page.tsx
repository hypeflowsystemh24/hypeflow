'use client'

import { useState } from 'react'
import {
  Plus, Link2, Eye, BarChart2, Copy, Trash2, X,
  GripVertical, Type, Mail, Phone, Building2, MessageSquare,
  ChevronDown, ToggleLeft, Hash, CheckSquare, Send, Zap,
} from 'lucide-react'

/* ─────────────────────── types ─────────────────────── */

type FieldType = 'text' | 'email' | 'phone' | 'company' | 'textarea' | 'select' | 'number' | 'checkbox'

interface FormField {
  id: string; type: FieldType; label: string
  placeholder?: string; required: boolean; options?: string[]
}

interface Form {
  id: string; name: string; slug: string; status: 'active' | 'draft' | 'paused'
  responses: number; leads_created: number; whatsapp_notify: boolean
  created_at: string; fields: FormField[]
  typeform_id?: string; tally_id?: string
}

/* ─────────────────────── mock data ─────────────────────── */

const DEFAULT_FIELDS: FormField[] = [
  { id: 'f1', type: 'text',     label: 'Nome completo',    placeholder: 'O seu nome', required: true },
  { id: 'f2', type: 'email',    label: 'Email',            placeholder: 'email@empresa.com', required: true },
  { id: 'f3', type: 'phone',    label: 'Telemóvel',        placeholder: '+351 9XX XXX XXX', required: true },
  { id: 'f4', type: 'company',  label: 'Empresa',          placeholder: 'Nome da empresa', required: false },
  { id: 'f5', type: 'textarea', label: 'Qual o seu maior desafio de marketing agora?', placeholder: 'Descreva brevemente...', required: true },
  { id: 'f6', type: 'select',   label: 'Orçamento mensal para publicidade', required: true,
    options: ['Menos de €500', '€500 – €1.500', '€1.500 – €5.000', 'Mais de €5.000'] },
  { id: 'f7', type: 'select',   label: 'Onde investe actualmente?', required: false,
    options: ['Facebook/Instagram Ads', 'Google Ads', 'LinkedIn Ads', 'Não invisto ainda', 'Vários canais'] },
  { id: 'f8', type: 'checkbox', label: 'Aceito ser contactado pela equipa HYPE Flow', required: true },
]

const MOCK_FORMS: Form[] = [
  {
    id: 'form-1', name: 'Qualificação Geral', slug: 'qualificacao-geral',
    status: 'active', responses: 47, leads_created: 43, whatsapp_notify: true,
    created_at: '2024-02-01', fields: DEFAULT_FIELDS,
  },
  {
    id: 'form-2', name: 'Lead Fria — Reactivação', slug: 'reativacao',
    status: 'active', responses: 12, leads_created: 11, whatsapp_notify: true,
    created_at: '2024-02-15', fields: DEFAULT_FIELDS.slice(0, 5),
  },
  {
    id: 'form-3', name: 'Proposta Imobiliário', slug: 'proposta-imobiliario',
    status: 'draft', responses: 0, leads_created: 0, whatsapp_notify: false,
    created_at: '2024-03-01', fields: DEFAULT_FIELDS,
  },
]

/* ─────────────────────── field config ─────────────────────── */

const FIELD_TYPES: { type: FieldType; label: string; icon: typeof Type }[] = [
  { type: 'text',     label: 'Texto curto',    icon: Type },
  { type: 'email',    label: 'Email',          icon: Mail },
  { type: 'phone',    label: 'Telefone',       icon: Phone },
  { type: 'company',  label: 'Empresa',        icon: Building2 },
  { type: 'textarea', label: 'Texto longo',    icon: MessageSquare },
  { type: 'select',   label: 'Escolha múltipla', icon: ChevronDown },
  { type: 'number',   label: 'Número',         icon: Hash },
  { type: 'checkbox', label: 'Confirmação',    icon: CheckSquare },
]

const FIELD_ICONS: Record<FieldType, typeof Type> = {
  text: Type, email: Mail, phone: Phone, company: Building2,
  textarea: MessageSquare, select: ChevronDown, number: Hash, checkbox: CheckSquare,
}

const STATUS_CFG = {
  active: { label: 'Activo', color: '#1EC87A', bg: 'bg-[#1EC87A20]' },
  draft:  { label: 'Rascunho', color: '#3D6080', bg: 'bg-[#3D608020]' },
  paused: { label: 'Pausado', color: '#F5A623', bg: 'bg-[#F5A62320]' },
}

/* ─────────────────────── builder modal ─────────────────────── */

function BuilderModal({ form, onClose }: { form: Form | null; onClose: () => void }) {
  const [name, setName]   = useState(form?.name ?? '')
  const [fields, setFields] = useState<FormField[]>(form?.fields ?? DEFAULT_FIELDS.slice(0, 4))
  const [notifyWA, setNotifyWA] = useState(form?.whatsapp_notify ?? true)
  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'integrations'>('fields')
  const [notifyNumber, setNotifyNumber] = useState('+351 912 345 678')
  const [typeformId, setTypeformId] = useState(form?.typeform_id ?? '')
  const [tallyId, setTallyId] = useState(form?.tally_id ?? '')

  const addField = (type: FieldType) => {
    const labels: Record<FieldType, string> = {
      text: 'Nova pergunta', email: 'Email', phone: 'Telemóvel', company: 'Empresa',
      textarea: 'Pergunta aberta', select: 'Escolha múltipla', number: 'Número', checkbox: 'Confirmação',
    }
    setFields(f => [...f, {
      id: `f${Date.now()}`, type, label: labels[type],
      placeholder: '', required: false,
      options: type === 'select' ? ['Opção 1', 'Opção 2'] : undefined,
    }])
  }

  const removeField = (id: string) => setFields(f => f.filter(x => x.id !== id))
  const updateField = (id: string, key: keyof FormField, val: unknown) =>
    setFields(f => f.map(x => x.id === id ? { ...x, [key]: val } : x))

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--s1)] border border-white/10 rounded-2xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome do formulário..."
              className="bg-transparent text-base font-display font-800 text-white focus:outline-none placeholder-[#3D6080]"
            />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-[#3D6080] hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(['fields', 'settings', 'integrations'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-700 transition-colors border-b-2 -mb-px ${
                activeTab === tab ? 'border-[#21A0C4] text-[#21A0C4]' : 'border-transparent text-[#7FA8C4] hover:text-white'
              }`}>
              {tab === 'fields' ? 'Campos' : tab === 'settings' ? 'Configurações' : 'Integrações'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* FIELDS TAB */}
          {activeTab === 'fields' && (
            <div className="flex h-full">
              {/* Field list */}
              <div className="flex-1 p-5 flex flex-col gap-2 overflow-y-auto">
                <p className="label-system mb-1">Campos do formulário</p>
                {fields.map((field, i) => {
                  const Icon = FIELD_ICONS[field.type]
                  return (
                    <div key={field.id} className="bg-[var(--s2)] border border-white/5 rounded-xl p-3 group">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical size={12} className="text-[#3D6080] cursor-grab" />
                        <div className="w-5 h-5 rounded-md bg-[#21A0C422] flex items-center justify-center">
                          <Icon size={10} className="text-[#21A0C4]" />
                        </div>
                        <input
                          value={field.label}
                          onChange={e => updateField(field.id, 'label', e.target.value)}
                          className="flex-1 bg-transparent text-sm font-700 text-white focus:outline-none"
                        />
                        <button
                          onClick={() => updateField(field.id, 'required', !field.required)}
                          className={`text-[9px] font-700 px-1.5 py-0.5 rounded ${field.required ? 'text-[#E84545] bg-[#E8454520]' : 'text-[#3D6080] bg-[#3D608020]'}`}
                        >
                          {field.required ? 'obrigatório' : 'opcional'}
                        </button>
                        <button onClick={() => removeField(field.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#3D6080] hover:text-[#E84545] transition-all">
                          <Trash2 size={11} />
                        </button>
                      </div>
                      {field.type !== 'checkbox' && (
                        <input
                          value={field.placeholder ?? ''}
                          onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                          placeholder="Placeholder..."
                          className="w-full bg-[var(--s1)] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-[#7FA8C4] placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4]"
                        />
                      )}
                      {field.type === 'select' && field.options && (
                        <div className="mt-2 flex flex-col gap-1">
                          {field.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#3D6080]" />
                              <input
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...field.options!]
                                  newOpts[oi] = e.target.value
                                  updateField(field.id, 'options', newOpts)
                                }}
                                className="flex-1 bg-transparent text-[11px] text-[#7FA8C4] focus:outline-none"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => updateField(field.id, 'options', [...(field.options ?? []), 'Nova opção'])}
                            className="text-[10px] text-[#21A0C4] hover:text-[#4FC8EA] transition-colors mt-1">
                            + Adicionar opção
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add field panel */}
              <div className="w-52 flex-shrink-0 border-l border-white/5 p-4">
                <p className="label-system mb-3">Adicionar campo</p>
                <div className="flex flex-col gap-1.5">
                  {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                    <button key={type} onClick={() => addField(type)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--s2)] transition-colors group text-left">
                      <div className="w-6 h-6 rounded-lg bg-[#21A0C422] flex items-center justify-center">
                        <Icon size={11} className="text-[#21A0C4]" />
                      </div>
                      <span className="text-xs text-[#7FA8C4] group-hover:text-white transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="p-5 flex flex-col gap-5">
              <div>
                <label className="label-system block mb-2">Slug (URL pública)</label>
                <div className="flex items-center gap-2 bg-[var(--s2)] border border-white/5 rounded-xl px-3 py-2.5">
                  <span className="text-xs text-[#3D6080]">hypeflow.pt/f/</span>
                  <input
                    value={form?.slug ?? name.toLowerCase().replace(/\s+/g, '-')}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    readOnly
                  />
                  <button className="text-[#3D6080] hover:text-white transition-colors"><Copy size={12} /></button>
                </div>
              </div>

              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <p className="text-sm font-800 text-white">Notificação WhatsApp</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-700 text-white">Notificar quando lead preenche</p>
                    <p className="text-[10px] text-[#3D6080] mt-0.5">Envia relatório completo por WhatsApp</p>
                  </div>
                  <button
                    onClick={() => setNotifyWA(p => !p)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${notifyWA ? 'bg-[#21A0C4]' : 'bg-[var(--s2)] border border-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${notifyWA ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {notifyWA && (
                  <>
                    <div>
                      <label className="label-system block mb-1.5">
                        Número WhatsApp da empresa
                      </label>
                      <input
                        value={notifyNumber}
                        onChange={e => setNotifyNumber(e.target.value)}
                        className="w-full bg-[var(--s1)] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#21A0C4]"
                      />
                    </div>
                    <div className="bg-[var(--s1)] rounded-xl p-3 border border-white/5">
                      <p className="label-system mb-2">Preview da mensagem</p>
                      <p className="text-xs text-[#7FA8C4] leading-relaxed font-mono">
                        🔔 *Nova lead — HYPE Flow*{'\n\n'}
                        👤 *Nome:* João Silva{'\n'}
                        📧 *Email:* joao@empresa.com{'\n'}
                        📱 *Tel:* +351 912 345 678{'\n'}
                        🏢 *Empresa:* TechCorp Lda{'\n\n'}
                        💬 *Maior desafio:*{'\n'}
                        "Não consigo escalar as campanhas..."{'\n\n'}
                        💰 *Budget mensal:* €1.500 – €5.000{'\n'}
                        📊 *Investe em:* Facebook/Instagram Ads{'\n\n'}
                        ⭐ *Score IA:* 84/100{'\n'}
                        🌡️ *Temperatura:* Quente{'\n\n'}
                        👉 Ver lead: hypeflow.pt/comercial
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-sm font-800 text-white">Mensagem de agradecimento</p>
                <textarea
                  rows={3}
                  defaultValue="Obrigado pelo seu interesse! A nossa equipa vai contactá-lo em breve. 🚀"
                  className="w-full bg-[var(--s1)] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-[#7FA8C4] focus:outline-none focus:border-[#21A0C4] resize-none"
                />
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <div className="p-5 flex flex-col gap-4">
              <p className="text-xs text-[#7FA8C4]">
                Usa uma ferramenta externa? Conecta via webhook — as respostas entram automaticamente no CRM.
              </p>

              {/* Typeform */}
              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#262627] flex items-center justify-center text-base">📋</div>
                  <div>
                    <p className="text-sm font-800 text-white">Typeform</p>
                    <p className="text-[10px] text-[#3D6080]">Webhook → leads automáticas</p>
                  </div>
                </div>
                <div>
                  <label className="label-system block mb-1.5">Form ID do Typeform</label>
                  <input value={typeformId} onChange={e => setTypeformId(e.target.value)}
                    placeholder="ex: abc123XY" className="w-full bg-[var(--s1)] border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#3D6080] focus:outline-none focus:border-[#21A0C4]" />
                </div>
                <div>
                  <label className="label-system block mb-1.5">URL do Webhook (copia para o Typeform)</label>
                  <div className="flex items-center gap-2 bg-[var(--s1)] border border-white/5 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-[#7FA8C4] font-mono flex-1 truncate">https://hypeflow.pt/api/webhooks/typeform</span>
                    <button className="text-[#3D6080] hover:text-white transition-colors flex-shrink-0"><Copy size={12} /></button>
                  </div>
                </div>
              </div>

              {/* Tally */}
              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#1a1a2e] flex items-center justify-center text-base">📝</div>
                  <div>
                    <p className="text-sm font-800 text-white">Tally</p>
                    <p className="text-[10px] text-[#3D6080]">Webhook → leads automáticas</p>
                  </div>
                </div>
                <div>
                  <label className="label-system block mb-1.5">URL do Webhook (copia para o Tally)</label>
                  <div className="flex items-center gap-2 bg-[var(--s1)] border border-white/5 rounded-xl px-3 py-2.5">
                    <span className="text-xs text-[#7FA8C4] font-mono flex-1 truncate">https://hypeflow.pt/api/webhooks/tally</span>
                    <button className="text-[#3D6080] hover:text-white transition-colors flex-shrink-0"><Copy size={12} /></button>
                  </div>
                </div>
              </div>

              {/* Mapeamento de campos */}
              <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4">
                <p className="text-sm font-800 text-white mb-3">Mapeamento automático de campos</p>
                <div className="flex flex-col gap-2">
                  {[
                    { ext: 'name / nome / full_name', int: 'full_name' },
                    { ext: 'email',                   int: 'email' },
                    { ext: 'phone / telefone / tel',  int: 'phone' },
                    { ext: 'company / empresa',        int: 'company' },
                    { ext: 'message / mensagem',       int: 'notes' },
                  ].map(({ ext, int }) => (
                    <div key={int} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[#7FA8C4] flex-1">{ext}</span>
                      <span className="text-[#3D6080]">→</span>
                      <span className="font-700 text-[#21A0C4] w-28">{int}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/5 text-sm text-[#7FA8C4] hover:border-white/10 transition-colors">
            Cancelar
          </button>
          <button className="flex-1 py-2.5 rounded-xl border border-white/5 text-sm text-[#7FA8C4] hover:border-white/10 transition-colors">
            Guardar rascunho
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-[#21A0C4] text-sm font-700 text-[#050D14] hover:bg-[#4FC8EA] transition-colors">
            Publicar formulário
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── form card ─────────────────────── */

function FormCard({ form, onEdit }: { form: Form; onEdit: () => void }) {
  const st = STATUS_CFG[form.status]
  const convRate = form.responses > 0 ? Math.round((form.leads_created / form.responses) * 100) : 0
  const publicUrl = `hypeflow.pt/f/${form.slug}`

  return (
    <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-800 text-white">{form.name}</p>
          <p className="text-[10px] text-[#3D6080] mt-0.5 font-mono">{publicUrl}</p>
        </div>
        <span className={`text-[10px] font-700 px-2 py-0.5 rounded-lg ${st.bg}`} style={{ color: st.color }}>
          {st.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Respostas',   value: form.responses },
          { label: 'Leads',       value: form.leads_created },
          { label: 'Conversão',   value: `${convRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--s1)] rounded-xl p-2.5 text-center">
            <p className="text-base font-display font-800 text-white">{value}</p>
            <p className="text-[9px] text-[#3D6080] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-[#3D6080]">
        {form.whatsapp_notify && (
          <span className="flex items-center gap-1 text-[#25D366]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" /> WhatsApp activo
          </span>
        )}
        <span>{form.fields.length} campos</span>
        <span>· criado {new Date(form.created_at).toLocaleDateString('pt-PT')}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/5 text-xs font-700 text-[#7FA8C4] hover:border-white/10 hover:text-white transition-colors">
          <Zap size={11} /> Editar
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/5 text-xs font-700 text-[#7FA8C4] hover:border-white/10 hover:text-white transition-colors">
          <Eye size={11} /> Preview
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/5 text-xs font-700 text-[#7FA8C4] hover:border-white/10 hover:text-white transition-colors">
          <Copy size={11} />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────── page ─────────────────────── */

export default function FormulariosPage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)

  const totalResponses = MOCK_FORMS.reduce((s, f) => s + f.responses, 0)
  const totalLeads     = MOCK_FORMS.reduce((s, f) => s + f.leads_created, 0)

  return (
    <>
      {(showBuilder || editingForm) && (
        <BuilderModal form={editingForm} onClose={() => { setShowBuilder(false); setEditingForm(null) }} />
      )}

      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display-title" style={{ fontSize: '2.75rem' }}>Formulários</h1>
            <p className="text-sm text-[#7FA8C4] mt-0.5">
              {totalResponses} respostas · {totalLeads} leads criadas · notificação WhatsApp automática
            </p>
          </div>
          <button onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 text-xs font-700 text-[#050D14] bg-[#21A0C4] px-4 py-2 rounded-xl hover:bg-[#4FC8EA] transition-colors">
            <Plus size={13} /> Novo Formulário
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Formulários activos', value: MOCK_FORMS.filter(f => f.status === 'active').length, color: '#1EC87A' },
            { label: 'Total de respostas',  value: totalResponses, color: '#21A0C4' },
            { label: 'Leads geradas',       value: totalLeads,     color: '#F5A623' },
            { label: 'Taxa de conversão',   value: `${totalResponses > 0 ? Math.round((totalLeads / totalResponses) * 100) : 0}%`, color: '#4FC8EA' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[var(--s2)] border border-white/5 rounded-2xl p-4">
              <p className="display-title" style={{ fontSize: '2.75rem' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color }}>{label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-5">
          <p className="text-xs font-700 text-[#3D6080] uppercase tracking-widest mb-4">Como funciona</p>
          <div className="flex items-center gap-0">
            {[
              { icon: '📋', label: 'Lead preenche', sub: 'Form nativo, Typeform ou Tally' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '👤', label: 'Lead criada', sub: 'Automaticamente no CRM' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '💬', label: 'WhatsApp enviado', sub: 'Relatório completo para a empresa' },
              { icon: '→', label: '', sub: '', arrow: true },
              { icon: '📞', label: 'Pré-call pronto', sub: 'Respostas visíveis antes da call' },
            ].map((step, i) => step.arrow ? (
              <div key={i} className="flex-shrink-0 text-[#3D6080] px-2">→</div>
            ) : (
              <div key={i} className="flex-1 bg-[var(--s1)] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl mb-1.5">{step.icon}</div>
                <p className="text-xs font-800 text-white">{step.label}</p>
                <p className="text-[9px] text-[#3D6080] mt-0.5">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forms grid */}
        <div className="grid grid-cols-3 gap-4">
          {MOCK_FORMS.map(form => (
            <FormCard key={form.id} form={form} onEdit={() => setEditingForm(form)} />
          ))}
        </div>

        {/* Webhook endpoints */}
        <div className="bg-[var(--s2)] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={13} className="text-[#21A0C4]" />
            <p className="text-sm font-800 text-white">Endpoints de Integração</p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Typeform Webhook',  url: '/api/webhooks/typeform',        method: 'POST', note: 'Copia para Settings > Webhooks no Typeform' },
              { label: 'Tally Webhook',     url: '/api/webhooks/tally',           method: 'POST', note: 'Copia para Integrations > Webhooks no Tally' },
              { label: 'Form nativo',       url: '/api/forms/[slug]/submit',      method: 'POST', note: 'Usado automaticamente pelo form nativo' },
              { label: 'WhatsApp Notify',   url: '/api/notifications/whatsapp',   method: 'POST', note: 'Chamado internamente após cada submissão' },
            ].map(({ label, url, method, note }) => (
              <div key={url} className="flex items-center gap-3 bg-[var(--s1)] border border-white/5 rounded-xl px-4 py-3">
                <span className="text-[9px] font-800 bg-[#21A0C422] text-[#21A0C4] px-1.5 py-0.5 rounded-md flex-shrink-0">{method}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-700 text-white">{label}</p>
                  <p className="text-[10px] text-[#3D6080] font-mono truncate">{url}</p>
                </div>
                <p className="text-[10px] text-[#3D6080] truncate max-w-xs hidden lg:block">{note}</p>
                <button className="text-[#3D6080] hover:text-white transition-colors flex-shrink-0">
                  <Copy size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
