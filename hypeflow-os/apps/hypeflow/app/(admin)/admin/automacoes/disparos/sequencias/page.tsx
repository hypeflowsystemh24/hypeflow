import { SequenciasBuilder } from './components/SequenciasBuilder'

function isDemo() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return !url || url.includes('placeholder')
}

export default async function SequenciasPage() {
  let agencyId = 'demo-agency-id'
  if (!isDemo()) {
    const { ensureWorkspaceForCurrentUser } = await import('@/lib/bootstrap/workspace')
    const ws = await ensureWorkspaceForCurrentUser()
    agencyId = ws.agencyId ?? 'demo-agency-id'
  }
  return <SequenciasBuilder agencyId={agencyId} />
}
