import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Resolve user type: agency user or client user
  const { data: agencyUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (agencyUser) {
    redirect('/admin/dashboard')
  }

  redirect('/client/dashboard')
}
