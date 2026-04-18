import { NextRequest, NextResponse } from 'next/server'

interface CopyRequest {
  product: string
  audience: string   // pipeline stage label
  objective: 'aquecer' | 'qualificar' | 'fechar' | 'reactivar' | 'nutrir'
  tone: 'profissional' | 'casual' | 'urgente' | 'empatico'
  channel: 'email' | 'whatsapp' | 'sms'
}

interface CopyVariant {
  subject: string
  body: string
  cta: string
}

const CHAR_LIMITS: Record<string, number> = {
  email: 800,
  whatsapp: 300,
  sms: 160,
}

const SYSTEM_PROMPT = `És um copywriter especializado em vendas B2B em português europeu.
Crias copy persuasivo, directo e personalizado para equipas comerciais.
Nunca usas emojis em excesso. Preferes frases curtas e acção.
Devolves APENAS JSON válido — sem texto extra, sem markdown.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Return mock variants when no API key — for demo mode
    return NextResponse.json({ variants: getMockVariants(await req.json() as CopyRequest) })
  }

  let body: CopyRequest
  try {
    body = await req.json() as CopyRequest
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { product, audience, objective, tone, channel } = body
  const limit = CHAR_LIMITS[channel] ?? 800

  const userPrompt = `Cria 3 variantes de ${channel === 'email' ? 'email de vendas' : channel === 'whatsapp' ? 'mensagem WhatsApp' : 'SMS'} em português europeu para:
Produto/Serviço: ${product}
Audiência: leads em fase "${audience}" do pipeline
Objectivo: ${objective}
Tom: ${tone}
Tamanho máximo do corpo: ${limit} caracteres.
Inclui variáveis dinâmicas: {nome}, {empresa} onde fizer sentido.
Termina com CTA claro.

Devolve JSON com este formato exacto (sem markdown, apenas JSON):
[
  {"subject":"...","body":"...","cta":"..."},
  {"subject":"...","body":"...","cta":"..."},
  {"subject":"...","body":"...","cta":"..."}
]

${channel !== 'email' ? 'Para whatsapp/sms o campo subject deve ser a primeira frase de gancho.' : ''}`

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
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json() as { content: Array<{ text: string }> }
    const text = data.content[0]?.text ?? '[]'

    let variants: CopyVariant[]
    try {
      variants = JSON.parse(text) as CopyVariant[]
    } catch {
      // Try to extract JSON from response
      const match = text.match(/\[[\s\S]*\]/)
      variants = match ? JSON.parse(match[0]) as CopyVariant[] : getMockVariants(body)
    }

    return NextResponse.json({ variants })
  } catch (err) {
    console.error('[AI Copy] error:', err)
    return NextResponse.json({ variants: getMockVariants(body) })
  }
}

function getMockVariants(body: CopyRequest): CopyVariant[] {
  const { product, objective, tone } = body
  const toneLabel = tone === 'profissional' ? 'directo' : tone === 'urgente' ? 'urgente' : tone === 'empatico' ? 'personalizado' : 'casual'

  return [
    {
      subject: `{nome}, temos algo para si sobre ${product}`,
      body: `Olá {nome},\n\nVi que a {empresa} pode beneficiar muito com ${product}.\n\nEm poucos minutos consigo mostrar-lhe exactamente como.\n\nEstará disponível esta semana?`,
      cta: `Reservar 15 minutos`,
    },
    {
      subject: `${product} — o próximo passo para {empresa}`,
      body: `{nome},\n\nEquipas como a {empresa} usam ${product} para ${objective === 'fechar' ? 'acelerar decisões de compra' : 'crescer mais rápido'}.\n\nPosso partilhar 2 casos reais?`,
      cta: `Ver casos de sucesso`,
    },
    {
      subject: `Última oportunidade — ${product} para {empresa}`,
      body: `{nome},\n\nNão quero que a {empresa} perca esta janela.\n\n${product} está a ajudar empresas como a sua a ${toneLabel === 'urgente' ? 'fechar mais rápido' : 'crescer de forma consistente'}.\n\nPodemos falar hoje?`,
      cta: `Falar agora`,
    },
  ]
}
