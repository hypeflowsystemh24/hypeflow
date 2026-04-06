import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
// Stub until @hypeflow/integrations package is published
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GoogleCalendarClient: any = class {
  constructor(_token: string) {}
  async getEvent(_calendarId: string, _eventId: string) { return {} }
  static getMeetLink(_event: unknown) { return null }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshGoogleToken = null as any

/**
 * Google Calendar Push Notifications webhook
 * Called when a calendar event is created/updated/deleted
 *
 * Headers received:
 *   X-Goog-Channel-ID: our channel ID
 *   X-Goog-Resource-State: sync | exists | not_exists
 *   X-Goog-Resource-ID: Google's resource ID
 */
export async function POST(req: NextRequest) {
  const channelId = req.headers.get('X-Goog-Channel-ID')
  const resourceState = req.headers.get('X-Goog-Resource-State')
  const resourceId = req.headers.get('X-Goog-Resource-ID')

  // Ignore sync messages (initial handshake)
  if (resourceState === 'sync') {
    return NextResponse.json({ ok: true })
  }

  if (!channelId || !resourceId) {
    return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
  }

  try {
    const supabase = await createServiceClient()

    // Find the call associated with this channel
    const { data: call } = await supabase
      .from('calls')
      .select('id, agency_id, client_id, calendar_event_id, calendar_id, status')
      .eq('google_channel_id', channelId)
      .single()

    if (!call) {
      // Channel not found — could be a stale notification
      return NextResponse.json({ ok: true })
    }

    // Get the integration to fetch updated event data
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token, refresh_token, token_expiry')
      .eq('agency_id', call.agency_id)
      .eq('provider', 'google_calendar')
      .single()

    if (!integration?.access_token) {
      return NextResponse.json({ error: 'No integration found' }, { status: 400 })
    }

    // Refresh token if needed
    let accessToken = integration.access_token
    if (integration.token_expiry && new Date(integration.token_expiry) < new Date()) {
      const refreshed = await refreshGoogleToken(integration.refresh_token!)
      accessToken = refreshed.access_token

      await supabase
        .from('integrations')
        .update({
          access_token: refreshed.access_token,
          token_expiry: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq('agency_id', call.agency_id)
        .eq('provider', 'google_calendar')
    }

    const calendar = new GoogleCalendarClient(accessToken)

    if (resourceState === 'not_exists') {
      // Event deleted in Google Calendar → cancel call in platform
      await supabase
        .from('calls')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', call.id)
      return NextResponse.json({ ok: true, action: 'cancelled' })
    }

    // Fetch updated event
    const event = await calendar.getEvent(call.calendar_id!, call.calendar_event_id!)

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    // Sync scheduled_at if changed
    if (event.start?.dateTime) {
      updates.scheduled_at = event.start.dateTime
    }

    // Sync status
    if (event.status === 'cancelled') {
      updates.status = 'cancelled'
    }

    // Extract Meet link if updated
    const meetLink = GoogleCalendarClient.getMeetLink(event)
    if (meetLink) updates.meet_link = meetLink

    await supabase.from('calls').update(updates).eq('id', call.id)

    return NextResponse.json({ ok: true, action: 'updated' })
  } catch (err) {
    console.error('[google-calendar-webhook]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
