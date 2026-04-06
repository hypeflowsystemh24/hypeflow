import { KanbanBoard } from './components/KanbanBoard'

const PREVIEW_AGENCY_ID = 'preview-agency-id'

export default async function PipelinePage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-white">Pipeline</h1>
          <p className="text-sm text-[#7FA8C4] mt-0.5">Gestão de leads por fase</p>
        </div>
        <div className="text-xs font-700 text-[#7FA8C4] bg-[#0C1824] border border-white/5 px-4 py-2 rounded-xl">
          Vista: Kanban
        </div>
      </div>
      <KanbanBoard agencyId={PREVIEW_AGENCY_ID} />
    </div>
  )
}
