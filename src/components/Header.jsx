import { Plus, Briefcase, FileUp, Star, BookOpen } from 'lucide-react'

export default function Header({ candidatures, onAdd, onImport, onReview }) {
  const total = candidatures.length
  const prioritaires = candidatures.filter(c => c.priorite).length
  const entretiens = candidatures.filter(c => c.statut === 'entretien').length
  const acceptes = candidatures.filter(c => c.statut === 'accepte').length

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Recherche alternance</h1>
            <p className="text-xs text-slate-500 leading-tight">Tableau de bord candidatures</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <Stat label="Total" value={total} />
          {prioritaires > 0 && <Stat label="Prioritaires" value={prioritaires} accent="text-amber-500" icon={<Star size={13} className="fill-amber-400 text-amber-400" />} />}
          <Stat label="Entretiens" value={entretiens} accent="text-violet-600" />
          <Stat label="Acceptés" value={acceptes} accent="text-emerald-600" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onImport}
            title="Importer depuis Excel"
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <FileUp size={16} />
            <span className="hidden lg:inline">Importer Excel</span>
          </button>
          <button
            onClick={onReview}
            className="flex items-center gap-2 border border-violet-200 hover:bg-violet-50 text-violet-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <BookOpen size={16} />
            <span className="hidden lg:inline">Mode Review</span>
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nouvelle candidature</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value, accent = 'text-slate-900', icon }) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 text-2xl font-bold leading-tight ${accent}`}>
        {icon}
        {value}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
