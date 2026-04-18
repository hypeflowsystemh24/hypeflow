'use client'

import { useState, useCallback, useRef } from 'react'
import {
  X, Plus, Trash2, ChevronDown, ChevronUp,
  ArrowDown, Play, Save, RotateCcw,
  Zap, GitBranch, Clock, StopCircle,
  MessageSquare, Mail, Phone, Bell, Tag, ArrowRight,
  UserCheck, Webhook, Monitor, Activity, Star,
} from 'lucide-react'

/* ─── Types ─── */
type NodeType = 'trigger' | 'condition' | 'action' | 'delay' | 'branch' | 'behavior_branch' | 'end'

interface FlowNode {
  id: string
  type: NodeType
  label: string
  config: Record<string, string>
  expanded: boolean
}

/* ─── Node config ─── */
const NODE_CONFIG: Record<NodeType, { color: string; bg: string; icon: React.ElementType; label: string; description: string }> = {
  trigger:         { color: '#21A0C4', bg: 'rgba(33,160,196,0.12)',   icon: Zap,        label: 'Trigger',              description: 'Evento que inicia o fluxo' },
  condition:       { color: '#F5A623', bg: 'rgba(245,166,35,0.12)',   icon: GitBranch,  label: 'Condição',             description: 'Ramificação condicional IF/ELSE' },
  action:          { color: '#00E5A0', bg: 'rgba(0,229,160,0.12)',    icon: Play,       label: 'Acção',                description: 'Executa uma acção' },
  delay:           { color: '#7FA8C4', bg: 'rgba(127,168,196,0.12)', icon: Clock,      label: 'Delay',                description: 'Aguarda um período' },
  branch:          { color: '#9B59B6', bg: 'rgba(155,89,182,0.12)',   icon: GitBranch,  label: 'Branch',               description: 'Divide o fluxo em caminhos' },
  behavior_branch: { color: '#D1FF00', bg: 'rgba(209,255,0,0.10)',    icon: Activity,   label: 'Branch Comportamento', description: 'Rotas diferentes por comportamento do lead' },
  end:             { color: '#E84545', bg: 'rgba(232,69,69,0.12)',    icon: StopCircle, label: 'Fim',                  description: 'Termina o fluxo' },
}

const TRIGGER_OPTIONS = [
  { value: 'lead_created',     label: 'Lead criada',          icon: '👤' },
  { value: 'score_threshold',  label: 'Score atingido',        icon: '⭐' },
  { value: 'stage_changed',    label: 'Etapa alterada',        icon: '📋' },
  { value: 'before_call',      label: 'Antes de call',         icon: '📞' },
  { value: 'after_call',       label: 'Após call',             icon: '✅' },
  { value: 'temperature_changed', label: 'Temperatura alterada', icon: '🌡️' },
  { value: 'tag_added',        label: 'Tag adicionada',        icon: '🏷️' },
  { value: 'webhook',          label: 'Webhook externo',       icon: '🔗' },
]

const ACTION_OPTIONS = [
  { value: 'send_whatsapp',    label: 'Enviar WhatsApp',       icon: MessageSquare,  color: '#25D366' },
  { value: 'send_email',       label: 'Enviar Email',          icon: Mail,           color: '#EA4335' },
  { value: 'send_sms',         label: 'Enviar SMS',            icon: Phone,          color: '#F5A623' },
  { value: 'notify_agent',     label: 'Notificar Agente',      icon: Bell,           color: '#D1FF00' },
  { value: 'move_stage',       label: 'Mover Etapa',           icon: ArrowRight,     color: '#21A0C4' },
  { value: 'add_tag',          label: 'Adicionar Tag',         icon: Tag,            color: '#7FA8C4' },
  { value: 'assign_agent',     label: 'Atribuir Agente',       icon: UserCheck,      color: '#9B59B6' },
  { value: 'update_score',     label: 'Actualizar Score',      icon: Activity,       color: '#00E5A0' },
  { value: 'trigger_n8n',      label: 'Trigger N8N',           icon: Webhook,        color: '#EA4B71' },
  { value: 'platform_notify',  label: 'Notif. Plataforma',     icon: Monitor,        color: '#21A0C4' },
]

const DELAY_OPTIONS = [
  { value: '15m',  label: '15 minutos' },
  { value: '1h',   label: '1 hora' },
  { value: '3h',   label: '3 horas' },
  { value: '6h',   label: '6 horas' },
  { value: '24h',  label: '1 dia' },
  { value: '3d',   label: '3 dias' },
  { value: '7d',   label: '7 dias' },
  { value: '30d',  label: '30 dias' },
]

/* ─── Node Component ─── */
function FlowNodeCard({
  node,
  index,
  total,
  onDelete,
  onToggle,
  onUpdate,
  leadsActive,
}: {
  node: FlowNode
  index: number
  total: number
  onDelete: () => void
  onToggle: () => void
  onUpdate: (config: Record<string, string>) => void
  leadsActive?: number
}) {
  const cfg = NODE_CONFIG[node.type]
  const Icon = cfg.icon

  return (
    <div className="relative flex flex-col items-center">
      {/* Connector line above (not for first node) */}
      {index > 0 && (
        <div className="flex flex-col items-center mb-1">
          <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <ArrowDown size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
      )}

      {/* Node card */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: 'var(--s1)',
          border: `1px solid ${cfg.color}40`,
          boxShadow: `0 0 20px ${cfg.color}10`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          style={{ background: cfg.bg, borderBottom: node.expanded ? `1px solid ${cfg.color}20` : 'none' }}
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${cfg.color}22` }}
            >
              <Icon size={14} style={{ color: cfg.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                {leadsActive !== undefined && leadsActive > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${cfg.color}22`, color: cfg.color }}
                  >
                    {leadsActive} leads
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{node.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {index > 0 && node.type !== 'end' && (
              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100"
                style={{ color: '#E84545' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <Trash2 size={12} />
              </button>
            )}
            {node.expanded ? <ChevronUp size={14} style={{ color: 'var(--t3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--t3)' }} />}
          </div>
        </div>

        {/* Config panel */}
        {node.expanded && (
          <div className="p-4 flex flex-col gap-3">

            {/* TRIGGER config */}
            {node.type === 'trigger' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Evento de disparo</label>
                  <select
                    value={node.config.trigger ?? 'lead_created'}
                    onChange={e => onUpdate({ ...node.config, trigger: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {TRIGGER_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                    ))}
                  </select>
                </div>
                {node.config.trigger === 'score_threshold' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--t3)' }}>Score ≥</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={node.config.threshold ?? '70'}
                      onChange={e => onUpdate({ ...node.config, threshold: e.target.value })}
                      className="w-20 px-3 py-2 rounded-xl text-sm outline-none text-center"
                      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--t3)' }}>pontos</span>
                  </div>
                )}
                {node.config.trigger === 'temperature_changed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--t3)' }}>Para</span>
                    <select
                      value={node.config.to_temp ?? 'hot'}
                      onChange={e => onUpdate({ ...node.config, to_temp: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <option value="hot">HOT 🔴</option>
                      <option value="warm">WARM 🟡</option>
                      <option value="cold">COLD 🔵</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ACTION config */}
            {node.type === 'action' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Tipo de acção</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ACTION_OPTIONS.map(o => {
                      const OIcon = o.icon
                      const selected = node.config.action === o.value
                      return (
                        <button
                          key={o.value}
                          onClick={() => onUpdate({ ...node.config, action: o.value })}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-all"
                          style={{
                            background: selected ? `${o.color}18` : 'var(--s2)',
                            border: `1px solid ${selected ? o.color + '50' : 'transparent'}`,
                            color: selected ? o.color : 'var(--t2)',
                          }}
                        >
                          <OIcon size={11} style={{ color: o.color, flexShrink: 0 }} />
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {['send_whatsapp', 'send_email', 'send_sms'].includes(node.config.action ?? '') && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Template / mensagem</label>
                    <textarea
                      rows={2}
                      value={node.config.message ?? ''}
                      onChange={e => onUpdate({ ...node.config, message: e.target.value })}
                      placeholder="Olá {nome}, temos novidades para si..."
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                      style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                    <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>Variáveis: {'{nome}'} {'{empresa}'} {'{score}'} {'{hora_call}'}</p>
                  </div>
                )}
              </div>
            )}

            {/* DELAY config */}
            {node.type === 'delay' && (
              <div>
                <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Aguardar</label>
                <div className="flex flex-wrap gap-1.5">
                  {DELAY_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => onUpdate({ ...node.config, delay: o.value })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: node.config.delay === o.value ? 'rgba(127,168,196,0.2)' : 'var(--s2)',
                        color: node.config.delay === o.value ? '#7FA8C4' : 'var(--t3)',
                        border: `1px solid ${node.config.delay === o.value ? '#7FA8C440' : 'transparent'}`,
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CONDITION config */}
            {node.type === 'condition' && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--t3)' }}>Condição</label>
                <div className="flex items-center gap-2">
                  <select
                    value={node.config.field ?? 'score'}
                    onChange={e => onUpdate({ ...node.config, field: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <option value="score">Score</option>
                    <option value="temperature">Temperatura</option>
                    <option value="stage">Etapa</option>
                    <option value="source">Fonte</option>
                    <option value="tag">Tag</option>
                  </select>
                  <select
                    value={node.config.op ?? 'greater_than'}
                    onChange={e => onUpdate({ ...node.config, op: e.target.value })}
                    className="w-28 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <option value="equals">é igual</option>
                    <option value="greater_than">maior que</option>
                    <option value="less_than">menor que</option>
                    <option value="contains">contém</option>
                  </select>
                  <input
                    type="text"
                    value={node.config.value ?? ''}
                    onChange={e => onUpdate({ ...node.config, value: e.target.value })}
                    placeholder="valor"
                    className="w-20 px-3 py-2 rounded-xl text-sm outline-none text-center"
                    style={{ background: 'var(--s2)', color: 'var(--t1)', border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.15)' }}>
                    <p className="text-[10px] font-bold" style={{ color: '#00E5A0' }}>✓ SIM → continua</p>
                  </div>
                  <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(232,69,69,0.08)', border: '1px solid rgba(232,69,69,0.15)' }}>
                    <p className="text-[10px] font-bold" style={{ color: '#E84545' }}>✗ NÃO → sai do fluxo</p>
                  </div>
                </div>
              </div>
            )}

            {/* BEHAVIOR BRANCH config */}
            {node.type === 'behavior_branch' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: 'var(--t3)' }}>Comportamento a detectar</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { value: 'opened_email',      label: '📧 Abriu email',               hint: 'Lead abriu a última mensagem de email' },
                      { value: 'clicked_link',       label: '🔗 Clicou no link',            hint: 'Lead clicou num link enviado' },
                      { value: 'replied_whatsapp',   label: '💬 Respondeu no WhatsApp',     hint: 'Lead enviou resposta no WhatsApp' },
                      { value: 'opened_portal',      label: '🌐 Visitou portal',             hint: 'Lead acedeu ao portal do cliente' },
                      { value: 'no_activity_3d',     label: '😴 Sem actividade 3 dias',     hint: 'Lead não interagiu nos últimos 3 dias' },
                      { value: 'no_activity_7d',     label: '🧊 Sem actividade 7 dias',     hint: 'Lead fria — sem resposta em 7 dias' },
                      { value: 'score_dropped',      label: '📉 Score caiu',                hint: 'Score do lead desceu em relação à última avaliação' },
                      { value: 'temperature_hot',    label: '🔥 Temperatura: HOT',          hint: 'Lead marcado como HOT' },
                    ].map(o => {
                      const selected = node.config.behavior === o.value
                      return (
                        <button
                          key={o.value}
                          onClick={() => onUpdate({ ...node.config, behavior: o.value })}
                          className="flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: selected ? 'rgba(209,255,0,0.08)' : 'var(--s2)',
                            border: `1px solid ${selected ? 'rgba(209,255,0,0.3)' : 'transparent'}`,
                          }}
                        >
                          <span className="text-sm leading-none mt-0.5">{o.label.split(' ')[0]}</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: selected ? '#D1FF00' : 'var(--t1)' }}>
                              {o.label.slice(o.label.indexOf(' ') + 1)}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>{o.hint}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* Visual branch paths */}
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(209,255,0,0.08)', border: '1px solid rgba(209,255,0,0.2)' }}>
                    <p className="text-[10px] font-bold" style={{ color: '#D1FF00' }}>✓ SIM → caminho A</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Comportamento detectado</p>
                  </div>
                  <div className="flex-1 px-3 py-2 rounded-xl" style={{ background: 'rgba(127,168,196,0.08)', border: '1px solid rgba(127,168,196,0.2)' }}>
                    <p className="text-[10px] font-bold" style={{ color: '#7FA8C4' }}>✗ NÃO → caminho B</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--t3)' }}>Sem comportamento</p>
                  </div>
                </div>
              </div>
            )}

            {/* END config */}
            {node.type === 'end' && (
              <p className="text-xs text-center py-2" style={{ color: 'var(--t3)' }}>Lead sai do fluxo. Automação concluída.</p>
            )}
          </div>
        )}
      </div>

      {/* Add node button between nodes */}
      {index < total - 1 && (
        <div className="flex flex-col items-center my-1" style={{ opacity: 0.4 }}>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}
    </div>
  )
}

/* ─── Add Node Palette ─── */
function AddNodeMenu({ onAdd, onClose }: { onAdd: (type: NodeType) => void; onClose: () => void }) {
  const options: { type: NodeType; emoji: string; desc: string }[] = [
    { type: 'action',          emoji: '⚡', desc: 'Executa acção (enviar mensagem, mover etapa...)' },
    { type: 'delay',           emoji: '⏳', desc: 'Aguarda X tempo antes do próximo passo' },
    { type: 'condition',       emoji: '🔀', desc: 'Ramifica com base em condição (IF/ELSE)' },
    { type: 'behavior_branch', emoji: '🧠', desc: 'Rotas adaptativas por comportamento do lead' },
    { type: 'branch',          emoji: '🌿', desc: 'Divide em múltiplos caminhos paralelos' },
    { type: 'end',             emoji: '🛑', desc: 'Termina este caminho do fluxo' },
  ]

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 rounded-2xl p-2 w-72 shadow-2xl"
      style={{ background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.08)', top: '100%', marginTop: 8 }}
    >
      {options.map(o => {
        const cfg = NODE_CONFIG[o.type]
        return (
          <button
            key={o.type}
            onClick={() => { onAdd(o.type); onClose() }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all tonal-hover"
          >
            <span className="text-base w-6 flex-shrink-0">{o.emoji}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--t3)' }}>{o.desc}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ─── TEMPLATES ─── */
const TEMPLATES: { name: string; icon: string; nodes: Omit<FlowNode, 'id'>[] }[] = [
  {
    name: 'Boas-vindas Cross-Canal',
    icon: '👋',
    nodes: [
      { type: 'trigger',   label: 'Lead criada',         config: { trigger: 'lead_created' },                  expanded: false },
      { type: 'action',    label: 'WhatsApp de boas-vindas', config: { action: 'send_whatsapp', message: 'Olá {nome}! Obrigado pelo interesse. Posso ajudar?' }, expanded: false },
      { type: 'delay',     label: 'Aguardar 2h',         config: { delay: '3h' },                               expanded: false },
      { type: 'condition', label: 'Respondeu?',           config: { field: 'score', op: 'greater_than', value: '20' }, expanded: false },
      { type: 'action',    label: 'Email de follow-up',  config: { action: 'send_email', message: 'Olá {nome}, tentei contactar...' }, expanded: false },
      { type: 'end',       label: 'Fim',                  config: {},                                            expanded: false },
    ],
  },
  {
    name: 'Score Alto → Alerta',
    icon: '⭐',
    nodes: [
      { type: 'trigger',   label: 'Score atingido',      config: { trigger: 'score_threshold', threshold: '80' }, expanded: false },
      { type: 'action',    label: 'Notificar closer',    config: { action: 'notify_agent', message: '🔥 Lead {nome} atingiu score {score}! Ligar agora.' }, expanded: false },
      { type: 'action',    label: 'Mover para Hot',      config: { action: 'move_stage' },                       expanded: false },
      { type: 'end',       label: 'Fim',                  config: {},                                            expanded: false },
    ],
  },
  {
    name: 'Comportamento Adaptativo',
    icon: '🧠',
    nodes: [
      { type: 'trigger',         label: 'Lead criada',               config: { trigger: 'lead_created' },                                                           expanded: false },
      { type: 'action',          label: 'Email de boas-vindas',      config: { action: 'send_email', message: 'Olá {nome}, bem-vindo!' },                          expanded: false },
      { type: 'delay',           label: 'Aguardar 24h',              config: { delay: '24h' },                                                                     expanded: false },
      { type: 'behavior_branch', label: 'Abriu o email?',            config: { behavior: 'opened_email' },                                                         expanded: false },
      { type: 'action',          label: 'Caminho A — WhatsApp quente', config: { action: 'send_whatsapp', message: 'Olá {nome}! Vi que leu o nosso email. Podemos falar?' }, expanded: false },
      { type: 'action',          label: 'Caminho B — Reenvio',       config: { action: 'send_email', message: 'Olá {nome}, perdemos? Aqui está o nosso email novamente.' }, expanded: false },
      { type: 'end',             label: 'Fim',                       config: {},                                                                                    expanded: false },
    ],
  },
  {
    name: 'Reactivação Pós-Perda',
    icon: '🔄',
    nodes: [
      { type: 'trigger',   label: 'Lead perdida',        config: { trigger: 'stage_changed' },                  expanded: false },
      { type: 'delay',     label: 'Aguardar 7 dias',     config: { delay: '7d' },                               expanded: false },
      { type: 'action',    label: 'WhatsApp reactivação', config: { action: 'send_whatsapp', message: 'Olá {nome}, ainda a considerar? Temos uma oferta especial.' }, expanded: false },
      { type: 'delay',     label: 'Aguardar 30 dias',    config: { delay: '30d' },                              expanded: false },
      { type: 'action',    label: 'Email caso de uso',   config: { action: 'send_email' },                      expanded: false },
      { type: 'end',       label: 'Fim',                  config: {},                                            expanded: false },
    ],
  },
]

/* ─── Main Visual Editor ─── */
interface VisualEditorProps {
  onClose: () => void
  onSave?: (name: string, nodes: FlowNode[]) => void
  initialName?: string
}

export function VisualEditor({ onClose, onSave, initialName = '' }: VisualEditorProps) {
  const [name, setName] = useState(initialName)
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: 'n1', type: 'trigger', label: 'Seleccionar gatilho', config: { trigger: 'lead_created' }, expanded: true },
    { id: 'n2', type: 'end',     label: 'Fim do fluxo',        config: {},                          expanded: false },
  ])
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [saved, setSaved] = useState(false)
  const idCounter = useRef(100)

  const addNode = useCallback((afterIndex: number, type: NodeType) => {
    idCounter.current++
    const defaults: Record<NodeType, { label: string; config: Record<string, string> }> = {
      trigger:   { label: 'Seleccionar gatilho',  config: { trigger: 'lead_created' } },
      condition: { label: 'Nova condição',         config: { field: 'score', op: 'greater_than', value: '50' } },
      action:    { label: 'Nova acção',            config: { action: 'send_whatsapp' } },
      delay:     { label: 'Aguardar',              config: { delay: '24h' } },
      branch:          { label: 'Novo branch',              config: {} },
      behavior_branch: { label: 'Branch por Comportamento', config: { behavior: 'opened_email' } },
      end:       { label: 'Fim do fluxo',          config: {} },
    }
    const d = defaults[type]
    const newNode: FlowNode = { id: `n${idCounter.current}`, type, ...d, expanded: true }
    setNodes(prev => {
      const arr = [...prev]
      arr.splice(afterIndex + 1, 0, newNode)
      return arr
    })
  }, [])

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id))
  }, [])

  const toggleNode = useCallback((id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n))
  }, [])

  const updateNode = useCallback((id: string, config: Record<string, string>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, config } : n))
  }, [])

  const loadTemplate = useCallback((template: typeof TEMPLATES[0]) => {
    setName(template.name)
    setNodes(template.nodes.map((n, i) => ({ ...n, id: `n${Date.now()}${i}` })))
    setShowTemplates(false)
  }, [])

  const handleSave = () => {
    onSave?.(name, nodes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const actionCount = nodes.filter(n => n.type === 'action').length

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.7)' }}>
      {/* Sidebar — canvas */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--s0)' }}>

        {/* Top bar */}
        <div
          className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'var(--s1)' }}
        >
          <button onClick={onClose} className="p-2 rounded-xl tonal-hover" style={{ color: 'var(--t3)' }}>
            <X size={16} />
          </button>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da automação..."
            className="flex-1 bg-transparent text-lg font-bold outline-none"
            style={{ color: 'var(--t1)' }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(q => !q)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'var(--s2)', color: 'var(--t2)' }}
            >
              <Star size={13} /> Templates
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: saved ? '#00E5A0' : 'var(--cyan)', color: '#0D1117' }}
            >
              <Save size={13} /> {saved ? 'Guardado!' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="flex items-center gap-6 px-6 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'var(--s1)' }}
        >
          {[
            { label: 'Nós', value: nodes.length, color: 'var(--t2)' },
            { label: 'Acções', value: actionCount, color: '#00E5A0' },
            { label: 'Leads activos', value: 0, color: 'var(--cyan)' },
            { label: 'Estado', value: 'Rascunho', color: '#F5A623' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'var(--t3)' }}>{s.label}:</span>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-lg mx-auto flex flex-col gap-0 relative">
            {nodes.map((node, index) => (
              <div key={node.id} className="relative group">
                <FlowNodeCard
                  node={node}
                  index={index}
                  total={nodes.length}
                  onDelete={() => deleteNode(node.id)}
                  onToggle={() => toggleNode(node.id)}
                  onUpdate={config => updateNode(node.id, config)}
                  leadsActive={index === 0 ? 3 : undefined}
                />

                {/* Add between nodes button */}
                {index < nodes.length - 1 && (
                  <div className="relative flex justify-center" style={{ zIndex: 10 }}>
                    <button
                      onClick={() => setShowAddMenu(showAddMenu === index ? null : index)}
                      className="flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full transition-all my-1"
                      style={{
                        background: showAddMenu === index ? 'rgba(33,160,196,0.2)' : 'rgba(255,255,255,0.04)',
                        color: showAddMenu === index ? 'var(--cyan)' : 'rgba(255,255,255,0.2)',
                        border: `1px solid ${showAddMenu === index ? 'rgba(33,160,196,0.4)' : 'transparent'}`,
                      }}
                    >
                      <Plus size={10} /> Adicionar nó
                    </button>
                    {showAddMenu === index && (
                      <AddNodeMenu
                        onAdd={type => { addNode(index, type); setShowAddMenu(null) }}
                        onClose={() => setShowAddMenu(null)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add after last (before end) */}
            {nodes[nodes.length - 1]?.type !== 'end' && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => addNode(nodes.length - 1, 'action')}
                  className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(33,160,196,0.1)', color: 'var(--cyan)' }}
                >
                  <Plus size={14} /> Adicionar passo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates sidebar */}
      {showTemplates && (
        <div
          className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'var(--s1)' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-semibold" style={{ color: 'var(--t1)' }}>Templates</p>
            <button onClick={() => setShowTemplates(false)} style={{ color: 'var(--t3)' }}><X size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => loadTemplate(t)}
                className="flex flex-col gap-2 p-4 rounded-2xl text-left transition-all tonal-hover"
                style={{ background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.icon}</span>
                  <p className="text-sm font-semibold" style={{ color: 'var(--t1)' }}>{t.name}</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--t3)' }}>{t.nodes.length} passos</p>
                <div className="flex flex-wrap gap-1">
                  {t.nodes.filter(n => n.type !== 'end').map((n, j) => {
                    const cfg = NODE_CONFIG[n.type]
                    return (
                      <span key={j} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
