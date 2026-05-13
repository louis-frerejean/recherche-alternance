import { useState, useRef, useEffect } from 'react'
import { Plus, Briefcase, FileUp, BookOpen, LogOut, Columns, BarChart2, MoreHorizontal, Star } from 'lucide-react'

export default function Header({ candidatures, view, onViewChange, onAdd, onImport, onReview, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const total       = candidatures.length
  const prioritaires = candidatures.filter(c => c.priorite).length
  const entretiens  = candidatures.filter(c => c.statut === 'entretien').length

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shrink-0">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 hidden sm:block">Recherche alternance</span>
        </div>

        {/* Toggle Kanban / Stats — centre */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
          <ViewTab
            active={view === 'kanban'}
            icon={<Columns size={14} />}
            label="Kanban"
            onClick={() => onViewChange('kanban')}
          />
          <ViewTab
            active={view === 'stats'}
            icon={<BarChart2 size={14} />}
            label="Stats"
            onClick={() => onViewChange('stats')}
          />
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Compteurs discrets */}
          <div className="hidden md:flex items-center gap-4 mr-2">
            <MiniStat label="Total" value={total} />
            {prioritaires > 0 && <MiniStat label="Try hard" value={prioritaires} accent="text-amber-500" icon={<Star size={10} className="fill-amber-400 text-amber-400" />} />}
            <MiniStat label="Entretiens" value={entretiens} accent="text-violet-600" />
          </div>

          {/* + Nouvelle */}
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouvelle</span>
          </button>

          {/* Menu ⋯ */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`p-2 rounded-lg border transition-colors ${menuOpen ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <MoreHorizontal size={16} className="text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <MenuItem icon={<BookOpen size={14} />} label="Mode Review" onClick={() => { onReview(); setMenuOpen(false) }} />
                <MenuItem icon={<FileUp size={14} />} label="Importer Excel" onClick={() => { onImport(); setMenuOpen(false) }} />
                <div className="h-px bg-slate-100 my-1" />
                <MenuItem icon={<LogOut size={14} />} label="Se déconnecter" onClick={() => { onLogout(); setMenuOpen(false) }} danger />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function ViewTab({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
        active ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function MiniStat({ label, value, accent = 'text-slate-700', icon }) {
  return (
    <div className="text-center">
      <div className={`flex items-center gap-1 text-base font-bold leading-tight ${accent}`}>
        {icon}{value}
      </div>
      <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
    </div>
  )
}
