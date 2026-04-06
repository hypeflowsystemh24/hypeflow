import { NextRequest, NextResponse } from 'next/server'

/* ─── types ─── */
interface WhatsAppNotifyRequest {
  leadData: {
    full_name: string
    email: string
    phone: string
    company: string
    challenge?: string
    budget?: string
    source?: string
    ai_score: number
    temperature: 'hot' | 'warm' | 'cold'
  }
  formSlug?: string
  notifyNumber?: string
}

/* ─── build WA message ─── */
function buildMessage(data: WhatsAppNotifyRequest['leadData'], slug?: string): string {
  const emoji = data.temperature === 'hot' ? '🔥' : data.temperature === 'warm' ? '🌡️' : '🧊'
  const scoreBar = '█'.repeat(Math.floor(data.ai_score / 10)) + '░'.repeat(10 - Math.floor(data.ai_score / 10))

  const lines = [
    `🎯 *Novo Lead — HYPE Flow*`,
    ``,
    `👤 *Nome:* ${data.full_name}`,
    `📧 *Email:* ${data.email}`,
    data.phone ? `📱 *Telefone:* ${data.phone}` : '',
    data.company ? `🏢 *Empresa:* ${data.company}` : '',
    ``,
  ]

  if (data.challenge) {
    lines.push(`💬 *Desafio:*`)
    lines.push(`_${data.challenge.slice(0, 200)}${data.challenge.length > 200 ? '...' : ''}_`)
    lines.push(``)
  }

  if (data.budget) lines.push(`💰 *Orçamento:* ${data.budget}`)
  if (data.source) lines.push(`📣 *Canal:* ${data.source}`)

  lines.push(``)
  lines.push(`${emoji} *Score IA:* ${data.ai_score}/100`)
  lines.push(`${scoreBar}`)
  lines.push(`*Temperatura:* ${data.temperature.toUpperCase()}`)
  lines.push(``)
  lines.push(`🔗 *Ver no CRM:*`)
  lines.push(`https://app.hypeflow.io/comercial?lead=${encodeURIComponent(data.email)}`)
  lines.push(``)
  if (slug) lines.push(`_Formulário: ${slug} · ${new Date().toLocaleString('pt-PT')}_`)

  return lines.filter(l => l !== undefined).join('\n')
}

/* ─── POST /api/notifications/whatsapp ─── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WhatsAppNotifyRequest

    const { leadData, formSlug, notifyNumber } = body

    if (!leadData?.full_name) {
      return NextResponse.json({ error: 'Missing leadData' }, { status: 400 })
    }

    const message = buildMessage(leadData, formSlug)
    const toNumber = notifyNumber ?? process.env.WA_NOTIFY_NUMBER

    if (!toNumber) {
      console.warn('[WA NOTIFY] No notify number configured')
      return NextResponse.json({ sent: false, reason: 'No notify number configured' })
    }

    const waToken = process.env.WA_TOKEN
    const waPhoneId = process.env.WA_PHONE_NUMBER_ID

    if (!waToken || !waPhoneId) {
      // Preview mode — log message
      console.log('[WA NOTIFY PREVIEW]', `To: ${toNumber}`)
      console.log(message)
      return NextResponse.json({
        sent: false,
        preview: true,
        message,
        to: toNumber,
        reason: 'WA_TOKEN or WA_PHONE_NUMBER_ID not configured',
      })
    }

    // Send via WhatsApp Business API (Cloud API)
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toNumber.replace(/\D/g, ''),
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('[WA NOTIFY ERROR]', err)
      return NextResponse.json({ sent: false, error: err }, { status: 502 })
    }

    const result = await response.json()
    console.log('[WA NOTIFY SENT]', leadData.full_name, `to=${toNumber}`)

    return NextResponse.json({ sent: true, messageId: result.messages?.[0]?.id })
  } catch (err) {
    console.error('[WA NOTIFY EXCEPTION]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
