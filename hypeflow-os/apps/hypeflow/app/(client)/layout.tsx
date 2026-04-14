import { ClientSidebar } from '@/components/layout/client/Sidebar'
import { ClientTopBar } from '@/components/layout/client/TopBar'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve client name from client_users → clients join
  let clientName = 'Cliente'
  let clientNiche = ''

  if (user) {
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('id', user.id)
      .single()

    if (clientUser?.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('name, niche')
        .eq('id', clientUser.client_id)
        .single()

      if (client) {
        clientName = client.name
        clientNiche = client.niche ?? ''
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--s0)' }}>
      <ClientSidebar clientName={clientName} clientNiche={clientNiche} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClientTopBar clientName={clientName} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
