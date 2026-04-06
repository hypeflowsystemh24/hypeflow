import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

// Preview mode: layout renders without auth check
// In production, add Supabase auth check here
const MOCK_USER = {
  id: 'preview',
  email: 'admin@hypeflow.pt',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '',
} as const

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--s0)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <TopBar user={MOCK_USER as any} />
        <main className="flex-1 overflow-auto p-6" style={{ background: 'var(--s0)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
