import { NextRequest, NextResponse } from 'next/server'

/* ─── POST /api/email/test
   Validates a Resend API key and sends a test email.
─── */
export async function POST(req: NextRequest) {
  const { resend_api_key, to, from_name, from_email } = await req.json()

  if (!resend_api_key) {
    return NextResponse.json({ ok: false, error: 'API key em falta' }, { status: 400 })
  }

  const dest      = to         ?? 'test@hypeflow.pt'
  const fromName  = from_name  ?? 'HYPE Flow'
  const fromAddr  = from_email ?? 'noreply@hypeflow.pt'

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:40px auto;background:#141B24;border-radius:16px;overflow:hidden">
      <div style="background:#D1FF00;padding:32px;text-align:center">
        <div style="font-size:32px;font-weight:900;color:#0D1117">⚡ HYPE</div>
        <p style="color:#0D1117;font-size:18px;font-weight:700;margin-top:8px">Email a funcionar! ✅</p>
      </div>
      <div style="padding:32px;color:#8AAEC8;font-size:14px;line-height:1.6">
        <p>Parabéns! A integração de email está configurada correctamente.</p>
        <p style="margin-top:12px">A sua chave Resend está a funcionar e os emails serão entregues normalmente.</p>
      </div>
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${resend_api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    `${fromName} <${fromAddr}>`,
      to:      [dest],
      subject: '✅ Teste HYPE Flow — Email a funcionar!',
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    let friendly = 'Chave inválida ou sem permissões.'
    if (err.includes('invalid_api_key'))     friendly = 'API Key inválida. Verifique se copiou correctamente.'
    if (err.includes('validation_error'))    friendly = 'O endereço de email de destino é inválido.'
    if (err.includes('not_allowed'))         friendly = 'Domínio não verificado no Resend. Verifique o seu domínio.'
    return NextResponse.json({ ok: false, error: friendly }, { status: 400 })
  }

  const data = await res.json()
  return NextResponse.json({ ok: true, id: data.id })
}
