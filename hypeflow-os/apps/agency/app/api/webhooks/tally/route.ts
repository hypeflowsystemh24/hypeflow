import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/* ─── Tally payload types ─── */
interface TallyField {
  key: string
  label: string
  type: string
  value: string | string[] | number | boolean | null
  options?: Array<{ id: string; text: string }>
}

interface TallyPayload {
  eventId: string
  eventType: 'FORM_RESPONSE'
  createdAt: string
  data: {
    responseId: string
    submissionId: string
    respondentId: string
    formId: string
    formName: string
    createdAt: string
    fields: TallyField[]
  }
}

/* ─── label-based field mapping ─── */
const LABEL_KEYWORDS: Array<{ keywords: string[]; field: string }> = [
  { keywords: ['nome', 'name'],                        field: 'full_name' },
  { keywords: ['email', 'e-mail'],                     field: 'email' },
  { keywords: ['telefone', 'phone', 'whatsapp', 'tel'], field: 'phone' },
  { keywords: ['empresa', 'company', 'agência'],       field: 'company' },
  { keywords: ['desafio', 'challenge', 'problema'],    field: 'challenge' },
  { keywords: ['orçamento', 'budget', 'investimento'], field: 'budget' },
  { keywords: ['encontrou', 'canal', 'source'],        field: 'source' },
]

function mapLabel(label: string): string {
  const lower = label.toLowerCase()
  for (const { keywords, field } of LABEL_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) return field
  }
  return label
}

function extractTallyValue(field: TallyField): string {
  if (field.value === null || field.value === undefined) return ''
  if (Array.isArray(field.value)) return field.value.join(', ')
  return String(field.value)
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

/* ─── POST /api/webhooks/tally ─── */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('tally-signature') ?? ''
  const secret = process.env.TALLY_WEBHOOK_SECRET ?? ''

  if (secret && !verifySignature(rawBody, signature, secret)) {
    console.warn('[TALLY] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: TallyPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.eventType !== 'FORM_RESPONSE') {
    return NextResponse.json({ received: true, skipped: true })
  }

  const { data } = payload

  // Map Tally fields to CRM
  const mapped: Record<string, string> = {}
  for (const field of data.fields) {
    const crmField = mapLabel(field.label)
    mapped[crmField] = extractTallyValue(field)
  }

  const score = mapped.budget?.includes('€5.000') || mapped.budget?.includes('€15') ? 82 : 58
  const temperature = score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold'

  const leadData = {
    full_name: mapped.full_name ?? 'Lead Tally',
    email: mapped.email ?? '',
    phone: mapped.phone ?? '',
    company: mapped.company ?? '',
    source: 'tally',
    form_id: data.formId,
    form_name: data.formName,
    submission_id: data.submissionId,
    raw_answers: mapped,
    ai_score: score,
    temperature,
    submitted_at: data.createdAt,
  }

  // In production:
  // await supabase.from('leads').insert({ ...leadData, pipeline_stage_id: firstStage.id })
  // await sendWhatsAppNotification(leadData)

  console.log('[TALLY WEBHOOK]', data.formId, leadData.full_name, `score=${score}`)

  return NextResponse.json({ received: true, leadId: `preview-tally-${Date.now()}` })
}
