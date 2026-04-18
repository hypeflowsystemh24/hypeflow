import { NextRequest, NextResponse } from 'next/server'

interface AutomationNode {
  id: string
  tipo: 'trigger' | 'condicao' | 'acao' | 'delay' | 'branch' | 'fim'
  config: Record<string, unknown>
  next: string[]
}

const SYSTEM_PROMPT = `És um assistente especializado em converter descrições em português de fluxos de automação de vendas em JSON estruturado.

REGRAS:
- Devolve APENAS JSON válido — sem texto, sem markdown, sem explicações
- Cada nó tem: id (string), tipo, config (objecto), next (array de ids)
- Usa IDs simples: "t1", "a1", "c1", "d1", "b1", "fim"

TIPOS DE NÓ:
- trigger: {gatilho: "novo_lead"|"score_atingido"|"fase_mudou"|"tag_adicionada"|"inactividade", valor?: string}
- condicao: {campo: "score"|"temperatura"|"canal"|"fase"|"tag", operador: "maior"|"igual"|"contem", valor: string}
- acao: {accao: "enviar_email"|"enviar_whatsapp"|"enviar_sms"|"mover_pipeline"|"adicionar_tag"|"notificar_responsavel"|"actualizar_score", config: {...}}
- delay: {horas?: number, dias?: number}
- branch: {condicao: string, sim: string, nao: string} — next deve ser []
- fim: {}

FORMATO DE SAÍDA:
{"nodes": [...], "nome": "...", "descricao": "..."}

Exemplo simples: "quando lead chega a score 80, notificar o closer"
→ {"nodes":[{"id":"t1","tipo":"trigger","config":{"gatilho":"score_atingido","valor":"80"},"next":["a1"]},{"id":"a1","tipo":"acao","config":{"accao":"notificar_responsavel","config":{"mensagem":"Lead atingiu score 80"}},"next":["fim"]},{"id":"fim","tipo":"fim","config":{},"next":[]}],"nome":"Score 80 → Notificação","descricao":"Notifica o closer quando lead atinge score 80"}`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  let body: { prompt: string }
  try {
    body = await req.json() as { prompt: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  if (!apiKey) {
    // Demo fallback
    return NextResponse.json({ flow: getMockFlow(body.prompt) })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Converte esta descrição em JSON de automação:\n\n"${body.prompt}"` }],
      }),
    })

    if (!response.ok) throw new Error(`Anthropic error ${response.status}`)

    const data = await response.json() as { content: Array<{ text: string }> }
    const text = data.content[0]?.text ?? ''

    let flow: { nodes: AutomationNode[]; nome: string; descricao: string }
    try {
      const match = text.match(/\{[\s\S]*\}/)
      flow = JSON.parse(match ? match[0] : text) as typeof flow
    } catch {
      flow = getMockFlow(body.prompt)
    }

    return NextResponse.json({ flow })
  } catch (err) {
    console.error('[AI Automation] error:', err)
    return NextResponse.json({ flow: getMockFlow(body.prompt) })
  }
}

function getMockFlow(prompt: string): { nodes: AutomationNode[]; nome: string; descricao: string } {
  const lower = prompt.toLowerCase()
  const hasWhatsapp = lower.includes('whatsapp') || lower.includes('wa')
  const hasEmail = lower.includes('email')
  const hasScore = lower.includes('score')

  const nodes: AutomationNode[] = [
    {
      id: 't1',
      tipo: 'trigger',
      config: { gatilho: hasScore ? 'score_atingido' : 'novo_lead', valor: hasScore ? '80' : undefined },
      next: ['a1'],
    },
  ]

  if (hasWhatsapp) {
    nodes.push({
      id: 'a1',
      tipo: 'acao',
      config: { accao: 'enviar_whatsapp', config: { mensagem: 'Olá {nome}, temos novidades para si!' } },
      next: ['d1'],
    })
    nodes.push({ id: 'd1', tipo: 'delay', config: { horas: 4 }, next: ['a2'] })
    if (hasEmail) {
      nodes.push({
        id: 'a2',
        tipo: 'acao',
        config: { accao: 'enviar_email', config: { assunto: 'Follow-up', corpo: 'Ainda sem resposta?' } },
        next: ['fim'],
      })
    } else {
      nodes.push({ id: 'a2', tipo: 'acao', config: { accao: 'notificar_responsavel', config: { mensagem: 'Lead sem resposta após 4h' } }, next: ['fim'] })
    }
  } else if (hasEmail) {
    nodes.push({
      id: 'a1',
      tipo: 'acao',
      config: { accao: 'enviar_email', config: { assunto: 'Boas-vindas', corpo: 'Olá {nome}!' } },
      next: ['fim'],
    })
  } else {
    nodes.push({
      id: 'a1',
      tipo: 'acao',
      config: { accao: 'notificar_responsavel', config: { mensagem: 'Novo evento detectado' } },
      next: ['fim'],
    })
  }

  nodes.push({ id: 'fim', tipo: 'fim', config: {}, next: [] })

  return {
    nodes,
    nome: `Automação gerada por IA`,
    descricao: prompt.slice(0, 120),
  }
}
