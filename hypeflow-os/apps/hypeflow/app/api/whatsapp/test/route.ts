import { NextRequest, NextResponse } from 'next/server'

/* ─── POST /api/whatsapp/test
   Validates WhatsApp credentials and sends a test message.
─── */
export async function POST(req: NextRequest) {
  const { access_token, phone_number_id, test_number } = await req.json()

  if (!access_token || !phone_number_id) {
    return NextResponse.json({ ok: false, error: 'Token e Phone Number ID são obrigatórios' }, { status: 400 })
  }

  /* First validate the phone number ID exists */
  const checkRes = await fetch(
    `https://graph.facebook.com/v19.0/${phone_number_id}?fields=display_phone_number,verified_name`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!checkRes.ok) {
    const err = await checkRes.json()
    const msg = err?.error?.message ?? 'Credenciais inválidas'
    let friendly = msg
    if (msg.includes('Invalid OAuth'))     friendly = 'Access Token inválido. Verifique se copiou correctamente.'
    if (msg.includes('does not exist'))    friendly = 'Phone Number ID não encontrado. Verifique o valor.'
    if (msg.includes('permissions'))       friendly = 'Token sem permissões WhatsApp. Verifique as permissões da App.'
    return NextResponse.json({ ok: false, error: friendly }, { status: 400 })
  }

  const phoneInfo = await checkRes.json()

  /* Optionally send test message if test_number provided */
  if (test_number) {
    const msgRes = await fetch(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:   test_number,
          type: 'text',
          text: { body: '✅ HYPE Flow OS — WhatsApp configurado com sucesso! As mensagens automáticas já estão activas.' },
        }),
      }
    )

    if (!msgRes.ok) {
      /* Credentials OK but test message failed — still return success for config */
      return NextResponse.json({
        ok:           true,
        phone_number: phoneInfo.display_phone_number,
        name:         phoneInfo.verified_name,
        test_sent:    false,
        warning:      'Credenciais válidas, mas o número de teste não recebeu mensagem. Verifique se é um número autorizado na conta sandbox.',
      })
    }
  }

  return NextResponse.json({
    ok:           true,
    phone_number: phoneInfo.display_phone_number,
    name:         phoneInfo.verified_name,
    test_sent:    !!test_number,
  })
}
