import { NextRequest, NextResponse } from 'next/server'

/* ─── POST /api/email/test
   Step 1: Validate Resend API key via GET /domains
   Step 2 (optional): Send a test email if 'to' is provided
─── */
export async function POST(req: NextRequest) {
  const { resend_api_key, to, from_name } = await req.json()

  if (!resend_api_key) {
    return NextResponse.json({ ok: false, error: 'API Key em falta. Volta ao passo 2 e cola a chave.' }, { status: 400 })
  }

  /* Validate key by calling Resend account endpoint */
  const check = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${resend_api_key}` },
  })

  if (!check.ok) {
    const err = await check.text()
    let friendly = 'API Key inválida. Verifica se copiaste correctamente (começa com re_).'
    if (err.includes('invalid_api_key') || check.status === 401) friendly = 'API Key inválida. Verifica se copiaste correctamente (começa com re_).'
    if (err.includes('forbidden')       || check.status === 403) friendly = 'Sem permissões. Verifica as permissões da API Key no Resend.'
    return NextResponse.json({ ok: false, error: friendly }, { status: 400 })
  }

  /* If no test email requested, key is valid — done */
  if (!to) return NextResponse.json({ ok: true, test_sent: false })

  /* Send test email from Resend's default domain (always works on free plan) */
  const fromName = from_name ?? 'HYPE Flow'
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

  const send = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { Authorization: `Bearer ${resend_api_key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    `${fromName} <onboarding@resend.dev>`,
      to:      [to],
      subject: '✅ Teste HYPE Flow — Email a funcionar!',
      html,
    }),
  })

  /* Test email failure is non-blocking — key is already validated */
  const data = send.ok ? await send.json() : null
  return NextResponse.json({ ok: true, test_sent: send.ok, id: data?.id })
}
