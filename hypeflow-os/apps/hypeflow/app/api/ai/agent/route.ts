import { NextRequest, NextResponse } from 'next/server'

/* ─── Types ─── */
export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentRequest {
  messages: AgentMessage[]
  context?: {
    lead_name?: string
    lead_score?: number
    lead_stage?: string
    lead_source?: string
    last_interaction?: string
  }
  mode?: 'chat' | 'autonomous'  // chat = answer user, autonomous = suggest next action
}

const SYSTEM_PROMPT = `Você é o HYPE AI, um assistente especializado em CRM e vendas B2B integrado na plataforma HYPE Flow OS.

SUAS CAPACIDADES:
- Analisar leads e sugerir próximas acções de follow-up
- Resumir conversas e interacções com leads
- Redigir mensagens personalizadas (WhatsApp, email)
- Interpretar métricas e identificar oportunidades
- Alertar sobre leads que precisam de atenção urgente
- Sugerir playbooks e automações adequadas

CONTEXTO DA PLATAFORMA:
- A equipa usa stages: Nova → Qualificação → Proposta → Negociação → Fechado
- Score de 0 a 100 (>70 = HOT, 40-70 = WARM, <40 = COLD)
- Canais: WhatsApp, Email, Chamadas, Formulários

REGRAS:
- Responde SEMPRE em Português de Portugal
- Respostas concisas e accionáveis
- Quando sugerires mensagens, inclui o texto completo pronto a enviar
- Usa emojis com moderação, apenas quando adequado ao canal
- Nunca inventes dados — se não tiveres informação, diz claramente`

/* ─── Mock responses for demo mode ─── */
function getMockResponse(messages: AgentMessage[], context?: AgentRequest['context']): string {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() ?? ''

  if (lastMsg.includes('score') || lastMsg.includes('qualidade')) {
    return `Com base no score ${context?.lead_score ?? 'actual'} e no comportamento recente, este lead está **WARM** — existe interesse mas ainda sem urgência.\n\n**Sugestão de próxima acção:**\n1. Enviar caso de estudo relevante para o sector deles\n2. Agendar uma call de 15 min nos próximos 3 dias\n3. Monitorizar abertura do email para avaliar interesse\n\nQuer que redija a mensagem de follow-up?`
  }

  if (lastMsg.includes('mensagem') || lastMsg.includes('whatsapp') || lastMsg.includes('escreve')) {
    const name = context?.lead_name ?? 'João'
    return `Aqui está uma mensagem personalizada para ${name}:\n\n---\n*Olá ${name}! 👋*\n\nEspero que esteja tudo bem.\n\nEu estive a analisar o vosso perfil e acredito que temos uma solução que pode fazer uma diferença real para o vosso negócio.\n\nTeria 15 minutos esta semana para uma conversa rápida?\n\n📞 Estou disponível: Seg-Sex, 9h-18h\n---\n\nPosei a usar tom informal para criar rapport. Quer ajustar o tom ou o conteúdo?`
  }

  if (lastMsg.includes('análise') || lastMsg.includes('resumo') || lastMsg.includes('status')) {
    return `**Análise do lead ${context?.lead_name ?? 'seleccionado'}**\n\n📊 Score: ${context?.lead_score ?? '—'}/100 (${(context?.lead_score ?? 0) >= 70 ? '🔥 HOT' : (context?.lead_score ?? 0) >= 40 ? '🌡️ WARM' : '🔵 COLD'})\n📍 Etapa: ${context?.lead_stage ?? '—'}\n📡 Fonte: ${context?.lead_source ?? '—'}\n\n**Pontos positivos:**\n- Perfil alinhado com o nosso ICP\n- Interacção recente demonstra interesse\n\n**Alertas:**\n- Sem resposta nos últimos 2 dias\n- Proposta por enviar\n\n**Recomendação:** Avançar com call esta semana antes que o interesse arrefeça.`
  }

  if (lastMsg.includes('playbook') || lastMsg.includes('sequência')) {
    return `Para este perfil, recomendo o **Playbook "Score Alto → Urgência"**:\n\n1. 📞 Call imediata (hoje)\n2. 💬 WhatsApp com proposta personalizada (hoje)\n3. 💬 Confirmar interesse (D+1)\n4. 📅 Reunião de fecho (D+2)\n\nEste playbook tem **41% de taxa de fecho** para leads com score similar.\n\nQuer que eu active o playbook automaticamente?`
  }

  return `Entendi a sua questão. Com base no contexto disponível, aqui estão as minhas sugestões:\n\n**Acção imediata:** Entrar em contacto com o lead nas próximas 24 horas para manter o momentum.\n\n**Mensagem sugerida:** Personalizar com base no histórico de interacções e sector do lead.\n\n**Próximo passo:** Agendar uma demonstração ou call de qualificação.\n\nPosso ajudar a redigir a mensagem, analisar o score, ou sugerir o playbook mais adequado. O que prefere?`
}

/* ─── Handler ─── */
export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json()
    const { messages, context, mode = 'chat' } = body

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Demo mode
      const content = getMockResponse(messages, context)
      return NextResponse.json({ content, demo: true })
    }

    const contextBlock = context
      ? `\n\n[CONTEXTO DO LEAD]\nNome: ${context.lead_name ?? '—'}\nScore: ${context.lead_score ?? '—'}\nEtapa: ${context.lead_stage ?? '—'}\nFonte: ${context.lead_source ?? '—'}\nÚltima interacção: ${context.last_interaction ?? '—'}`
      : ''

    const systemMsg = SYSTEM_PROMPT + contextBlock + (mode === 'autonomous'
      ? '\n\nMODO: AUTÓNOMO — Sugere a próxima acção mais impactante sem esperar instrução.'
      : '')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemMsg,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text ?? ''

    return NextResponse.json({ content })
  } catch (err) {
    console.error('Agent route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
