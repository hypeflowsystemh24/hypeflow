'use client'

import { X } from 'lucide-react'
import type {
  WFNode, WFNodeType,
  TriggerConfig, WhatsappConfig, EmailConfig, SmsConfig, VoiceConfig, DelayConfig, ConditionConfig, EndConfig,
} from './types'

/* ─── small field components ─── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--t3)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 rounded-xl text-xs outline-none"
      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
    />
  )
}

function Select({ value, onChange, options }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 rounded-xl text-xs outline-none"
      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="px-3 py-2 rounded-xl text-xs outline-none resize-none"
      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.06)' }}
    />
  )
}

/* ─── per-type config forms ─── */

function TriggerForm({ cfg, onChange }: { cfg: TriggerConfig; onChange: (c: TriggerConfig) => void }) {
  return (
    <>
      <Field label="Tipo de trigger">
        <Select
          value={cfg.trigger_type}
          onChange={v => onChange({ ...cfg, trigger_type: v as TriggerConfig['trigger_type'] })}
          options={[
            { value: 'lead_created',    label: 'Lead criado'       },
            { value: 'stage_changed',   label: 'Etapa alterada'    },
            { value: 'score_threshold', label: 'Score atingido'    },
            { value: 'webhook',         label: 'Webhook'           },
            { value: 'manual',          label: 'Manual'            },
            { value: 'schedule',        label: 'Agendamento'       },
          ]}
        />
      </Field>

      {cfg.trigger_type === 'score_threshold' && (
        <>
          <Field label="Direção">
            <Select
              value={cfg.score_direction ?? 'above'}
              onChange={v => onChange({ ...cfg, score_direction: v as 'above' | 'below' })}
              options={[{ value: 'above', label: 'Acima de' }, { value: 'below', label: 'Abaixo de' }]}
            />
          </Field>
          <Field label="Score">
            <Input
              type="number"
              value={String(cfg.score_value ?? '')}
              onChange={v => onChange({ ...cfg, score_value: Number(v) })}
              placeholder="ex: 70"
            />
          </Field>
        </>
      )}

      {cfg.trigger_type === 'stage_changed' && (
        <>
          <Field label="De etapa">
            <Input value={cfg.stage_from ?? ''} onChange={v => onChange({ ...cfg, stage_from: v })} placeholder="Qualificação" />
          </Field>
          <Field label="Para etapa">
            <Input value={cfg.stage_to ?? ''} onChange={v => onChange({ ...cfg, stage_to: v })} placeholder="Proposta" />
          </Field>
        </>
      )}

      {cfg.trigger_type === 'schedule' && (
        <Field label="Cron expression">
          <Input value={cfg.cron_expression ?? ''} onChange={v => onChange({ ...cfg, cron_expression: v })} placeholder="0 9 * * 1" />
        </Field>
      )}
    </>
  )
}

function WhatsappForm({ cfg, onChange }: { cfg: WhatsappConfig; onChange: (c: WhatsappConfig) => void }) {
  return (
    <>
      <Field label="Mensagem">
        <Textarea
          value={cfg.message}
          onChange={v => onChange({ ...cfg, message: v })}
          placeholder="Olá {{lead_name}}, temos uma proposta especial para si!"
          rows={4}
        />
      </Field>
      <Field label="Template ID (opcional)">
        <Input
          value={cfg.template_id ?? ''}
          onChange={v => onChange({ ...cfg, template_id: v || undefined })}
          placeholder="welcome_pt"
        />
      </Field>
      <Field label="Delay após envio (min)">
        <Input
          type="number"
          value={String(cfg.delay_after_minutes ?? '')}
          onChange={v => onChange({ ...cfg, delay_after_minutes: v ? Number(v) : undefined })}
          placeholder="0"
        />
      </Field>
    </>
  )
}

function EmailForm({ cfg, onChange }: { cfg: EmailConfig; onChange: (c: EmailConfig) => void }) {
  return (
    <>
      <Field label="Assunto">
        <Input value={cfg.subject} onChange={v => onChange({ ...cfg, subject: v })} placeholder="Olá {{lead_name}}!" />
      </Field>
      <Field label="Corpo">
        <Textarea value={cfg.body} onChange={v => onChange({ ...cfg, body: v })} rows={5} placeholder="Conteúdo do email..." />
      </Field>
      <Field label="Nome remetente">
        <Input value={cfg.from_name ?? ''} onChange={v => onChange({ ...cfg, from_name: v })} placeholder="HYPE Team" />
      </Field>
    </>
  )
}

function SmsForm({ cfg, onChange }: { cfg: SmsConfig; onChange: (c: SmsConfig) => void }) {
  return (
    <>
      <Field label="Mensagem SMS">
        <Textarea
          value={cfg.message}
          onChange={v => onChange({ ...cfg, message: v })}
          placeholder="Olá {{full_name}}, tem uma mensagem para si!"
          rows={3}
        />
      </Field>
      <p className="text-[10px] px-1" style={{ color: 'var(--t3)' }}>
        Suporta variáveis: {'{{full_name}}'}, {'{{phone}}'}, {'{{score}}'}
      </p>
    </>
  )
}

function VoiceForm({ cfg, onChange }: { cfg: VoiceConfig; onChange: (c: VoiceConfig) => void }) {
  return (
    <>
      <Field label="Script de voz">
        <Textarea
          value={cfg.script}
          onChange={v => onChange({ ...cfg, script: v })}
          placeholder="Olá {{full_name}}, está disponível para uma conversa rápida?"
          rows={4}
        />
      </Field>
      <Field label="Tentativas máximas">
        <Input
          type="number"
          value={String(cfg.max_attempts ?? 3)}
          onChange={v => onChange({ ...cfg, max_attempts: Math.max(1, Number(v)) })}
          placeholder="3"
        />
      </Field>
    </>
  )
}

function DelayForm({ cfg, onChange }: { cfg: DelayConfig; onChange: (c: DelayConfig) => void }) {
  return (
    <div className="flex gap-2">
      <Field label="Quantidade">
        <Input
          type="number"
          value={String(cfg.value)}
          onChange={v => onChange({ ...cfg, value: Math.max(1, Number(v)) })}
          placeholder="1"
        />
      </Field>
      <Field label="Unidade">
        <Select
          value={cfg.unit}
          onChange={v => onChange({ ...cfg, unit: v as DelayConfig['unit'] })}
          options={[
            { value: 'minutes', label: 'Minutos' },
            { value: 'hours',   label: 'Horas'   },
            { value: 'days',    label: 'Dias'     },
          ]}
        />
      </Field>
    </div>
  )
}

function ConditionForm({ cfg, onChange }: { cfg: ConditionConfig; onChange: (c: ConditionConfig) => void }) {
  return (
    <>
      <Field label="Campo">
        <Select
          value={cfg.field}
          onChange={v => onChange({ ...cfg, field: v as ConditionConfig['field'] })}
          options={[
            { value: 'score',  label: 'Score'       },
            { value: 'stage',  label: 'Etapa'       },
            { value: 'tag',    label: 'Tag'         },
            { value: 'source', label: 'Origem'      },
            { value: 'custom', label: 'Campo custom'},
          ]}
        />
      </Field>
      <Field label="Operador">
        <Select
          value={cfg.operator}
          onChange={v => onChange({ ...cfg, operator: v as ConditionConfig['operator'] })}
          options={[
            { value: 'equals',       label: 'Igual a'       },
            { value: 'not_equals',   label: 'Diferente de'  },
            { value: 'greater_than', label: 'Maior que'     },
            { value: 'less_than',    label: 'Menor que'     },
            { value: 'contains',     label: 'Contém'        },
            { value: 'not_contains', label: 'Não contém'    },
          ]}
        />
      </Field>
      <Field label="Valor">
        <Input value={cfg.value} onChange={v => onChange({ ...cfg, value: v })} placeholder="70" />
      </Field>
      <div className="flex gap-2">
        <Field label="Label Sim">
          <Input value={cfg.true_label ?? 'Sim'} onChange={v => onChange({ ...cfg, true_label: v })} />
        </Field>
        <Field label="Label Não">
          <Input value={cfg.false_label ?? 'Não'} onChange={v => onChange({ ...cfg, false_label: v })} />
        </Field>
      </div>
    </>
  )
}

function EndForm({ cfg, onChange }: { cfg: EndConfig; onChange: (c: EndConfig) => void }) {
  return (
    <>
      <Field label="Razão">
        <Select
          value={cfg.reason ?? 'completed'}
          onChange={v => onChange({ ...cfg, reason: v as EndConfig['reason'] })}
          options={[
            { value: 'completed',    label: 'Concluído'     },
            { value: 'converted',    label: 'Convertido'    },
            { value: 'unsubscribed', label: 'Descadastrado' },
            { value: 'failed',       label: 'Falhou'        },
          ]}
        />
      </Field>
      <Field label="Nota (opcional)">
        <Input value={cfg.note ?? ''} onChange={v => onChange({ ...cfg, note: v || undefined })} placeholder="Observação interna" />
      </Field>
    </>
  )
}

/* ─── main panel ─── */

interface Props {
  node:     WFNode
  onUpdate: (nodeId: string, data: Partial<WFNode['data']>) => void
  onClose:  () => void
  onDelete: (nodeId: string) => void
}

const TYPE_LABELS: Record<WFNodeType, string> = {
  trigger:   'Trigger',
  whatsapp:  'WhatsApp',
  email:     'E-mail',
  sms:       'SMS',
  voice:     'Chamada',
  delay:     'Esperar',
  condition: 'Condição',
  end:       'Fim',
}

export function NodeConfigPanel({ node, onUpdate, onClose, onDelete }: Props) {
  const type = node.type as WFNodeType

  function updateConfig(cfg: WFNode['data']['config']) {
    onUpdate(node.id, { config: cfg })
  }

  return (
    <div
      className="w-72 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'var(--s0)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--t1)' }}>{TYPE_LABELS[type]}</p>
          <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{node.id}</p>
        </div>
        <button onClick={onClose} className="tonal-hover p-1.5 rounded-lg" style={{ color: 'var(--t3)' }}>
          <X size={13} />
        </button>
      </div>

      {/* Label */}
      <div className="px-4 pt-4">
        <Field label="Nome do nó">
          <Input
            value={node.data.label}
            onChange={v => onUpdate(node.id, { label: v })}
            placeholder="Nome descritivo"
          />
        </Field>
      </div>

      {/* Divider */}
      <div className="mx-4 my-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Type-specific config */}
      <div className="px-4 flex flex-col gap-3">
        {type === 'trigger'   && <TriggerForm   cfg={node.data.config as TriggerConfig}   onChange={updateConfig} />}
        {type === 'whatsapp'  && <WhatsappForm  cfg={node.data.config as WhatsappConfig}  onChange={updateConfig} />}
        {type === 'email'     && <EmailForm     cfg={node.data.config as EmailConfig}     onChange={updateConfig} />}
        {type === 'sms'       && <SmsForm       cfg={node.data.config as SmsConfig}       onChange={updateConfig} />}
        {type === 'voice'     && <VoiceForm     cfg={node.data.config as VoiceConfig}     onChange={updateConfig} />}
        {type === 'delay'     && <DelayForm     cfg={node.data.config as DelayConfig}     onChange={updateConfig} />}
        {type === 'condition' && <ConditionForm cfg={node.data.config as ConditionConfig} onChange={updateConfig} />}
        {type === 'end'       && <EndForm       cfg={node.data.config as EndConfig}       onChange={updateConfig} />}
      </div>

      {/* Delete */}
      <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => onDelete(node.id)}
          className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          Remover nó
        </button>
      </div>
    </div>
  )
}
