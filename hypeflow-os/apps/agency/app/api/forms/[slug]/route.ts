import { NextRequest, NextResponse } from 'next/server'

/* ─── types ─── */
interface FormSubmission {
  formId: string
  slug: string
  values: Record<string, string>
  submittedAt: string
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
}

/* ─── helpers ─── */
function computeScore(values: Record<string, string>): number {
  let score = 40 // base
  if (values.f7?.includes('€5.000') || values.f7?.includes('> €15.000')) score += 30
  else if (values.f7?.includes('€1.500')) score += 20
  else if (values.f7?.includes('€500')) score += 10
  if ((values.f6?.length ?? 0) > 50) score += 15
  if (values.f3) score += 10
  if (values.f2) score += 5
  return Math.min(score, 99)
}

function computeTemperature(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}

function buildWhatsAppMessage(data: FormSubmission['leadData'], slug: string): string {
  const emoji = data.temperature === 'hot' ? '🔥' : data.temperature === 'warm' ? '🌡️' : '🧊'
  return [
    `🎯 *Novo Lead via Formulário*`,
    ``,
    `👤 *Nome:* ${data.full_name}`,
    `📧 *Email:* ${data.email}`,
    `📱 *Telefone:* ${data.phone}`,
    `🏢 *Empresa:* ${data.company}`,
    data.challenge ? `💬 *Desafio:* ${data.challenge.slice(0, 120)}${data.challenge.length > 120 ? '...' : ''}` : '',
    data.budget ? `💰 *Orçamento:* ${data.budget}` : '',
    data.source ? `📣 *Canal:* ${data.source}` : '',
    ``,
    `${emoji} *Score IA:* ${data.ai_score}/100 · ${data.temperature.toUpperCase()}`,
    `🔗 *CRM:* https://app.hypeflow.io/comercial?lead=${encodeURIComponent(data.email)}`,
    ``,
    `_Formulário: ${slug} · ${new Date().toLocaleString('pt-PT')}_`,
  ].filter(Boolean).join('\n')
}

/* ─── POST /api/forms/[slug]/submit ─── */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { formId, values } = body as { formId: string; values: Record<string, string> }

    if (!formId || !values) {
      return NextResponse.json({ error: 'Missing formId or values' }, { status: 400 })
    }

    // Extract lead data from form values (field mapping)
    const leadData: FormSubmission['leadData'] = {
      full_name: values.f1 ?? '',
      email: values.f2 ?? '',
      phone: values.f3 ?? '',
      company: values.f4 ?? '',
      challenge: values.f6,
      budget: values.f7,
      source: values.f8,
      ai_score: computeScore(values),
      temperature: computeTemperature(computeScore(values)),
    }

    const submission: FormSubmission = {
      formId,
      slug: params.slug,
      values,
      submittedAt: new Date().toISOString(),
      leadData,
    }

    // In production:
    // 1. Insert lead into Supabase with form_submission_id
    // 2. Insert form_answer rows per field
    // 3. Assign to first pipeline stage
    // const { data: lead } = await supabase.from('leads').insert({ ...leadData, pipeline_stage_id: firstStage.id }).single()
    // await supabase.from('form_answers').insert(Object.entries(values).map(([fieldId, answer]) => ({ lead_id: lead.id, field_id: fieldId, answer })))

    // Send WhatsApp notification
    const waMessage = buildWhatsAppMessage(leadData, params.slug)

    // In production: call WhatsApp Business API
    // await fetch('https://graph.facebook.com/v18.0/{phone-number-id}/messages', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: process.env.WA_NOTIFY_NUMBER,
    //     type: 'text',
    //     text: { body: waMessage },
    //   }),
    // })

    console.log('[FORM SUBMIT]', submission.slug, leadData.full_name, `score=${leadData.ai_score}`)
    console.log('[WA MESSAGE]', waMessage)

    return NextResponse.json({
      success: true,
      leadId: `preview-lead-${Date.now()}`,
      score: leadData.ai_score,
      temperature: leadData.temperature,
    })
  } catch (err) {
    console.error('[FORM SUBMIT ERROR]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ─── GET /api/forms/[slug] — fetch public form definition ─── */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // In production: query Supabase for the form by slug, check is_published
  // const { data: form } = await supabase.from('forms').select('*,form_fields(*)').eq('slug', params.slug).eq('is_published', true).single()

  return NextResponse.json({
    slug: params.slug,
    status: 'preview',
    message: 'Form API endpoint ready — connect Supabase to activate',
  })
}
