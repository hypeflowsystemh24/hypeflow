import { TrafficDashboardClient } from './components/TrafficDashboardClient'

const MOCK_CLIENTS = [
  { id: 'preview-client-1', name: 'TechnoSpark Lda', niche: 'SaaS B2B' },
  { id: 'preview-client-2', name: 'Clínica Estética Silva', niche: 'Saúde & Beleza' },
  { id: 'preview-client-3', name: 'Imobiliária Horizonte', niche: 'Imobiliário' },
]

export default async function TrafegoPage() {
  return (
    <TrafficDashboardClient
      agencyId="preview-agency-id"
      clients={MOCK_CLIENTS}
    />
  )
}
