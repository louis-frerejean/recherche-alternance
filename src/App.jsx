import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import StatsView from './components/StatsView'
import CompanyDetail from './components/CompanyDetail'
import CandidatureModal from './components/CandidatureModal'
import ImportExcel from './components/ImportExcel'
import ReviewMode from './components/ReviewMode'
import { useCandidatures } from './hooks/useCandidatures'
import { usePlatformStats } from './hooks/usePlatformStats'
import { groupByCompany } from './utils/groupCandidatures'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <Loader />
  if (!session) return <Auth />
  return <AppContent userId={session.user.id} />
}

function AppContent({ userId }) {
  const { candidatures, loading: loadingC, add, update, remove, updateStatut, togglePriorite, setGroupPriorite, importAll, migrateFromLocalStorage } = useCandidatures(userId)
  const { platforms, update: updatePlatform, updateNom: updatePlatformNom, add: addPlatform, remove: removePlatform } = usePlatformStats(userId)

  const [view, setView]           = useState('kanban')
  const [modal, setModal]         = useState(null)
  const [openGroup, setOpenGroup] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showImport, setShowImport]       = useState(false)
  const [showReview, setShowReview]       = useState(false)
  const [migrated, setMigrated]   = useState(false)

  // Migration one-shot depuis localStorage
  useEffect(() => {
    if (loadingC || migrated) return
    migrateFromLocalStorage().then(did => { if (did) setMigrated(true) })
  }, [loadingC])

  const localCount = (() => {
    try { const d = localStorage.getItem('alternance_candidatures_v2'); return d ? JSON.parse(d).length : 0 } catch { return 0 }
  })()
  const showMigrationBanner = !loadingC && !migrated && localCount > 0 && candidatures.length === 0
  const [migrating, setMigrating] = useState(false)
  async function handleMigrate() {
    setMigrating(true)
    const did = await migrateFromLocalStorage()
    setMigrating(false)
    if (did) setMigrated(true)
  }

  function openAdd()    { setModal({ mode: 'add' }) }
  function openEdit(c)  { setOpenGroup(null); setModal({ mode: 'edit', candidature: c }) }
  function closeModal() { setModal(null) }

  function handleSave(form) {
    if (modal.mode === 'add') add(form)
    else update(modal.candidature.id, form)
    closeModal()
  }

  function handleDelete(id) {
    setOpenGroup(null)
    setDeleteConfirm(id)
  }

  function confirmDelete() {
    if (deleteConfirm) { remove(deleteConfirm); setDeleteConfirm(null) }
  }

  const liveOpenGroup = openGroup
    ? groupByCompany(candidatures).find(g => g.key === openGroup.key) ?? null
    : null

  if (loadingC) return <Loader />

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        candidatures={candidatures}
        view={view}
        onViewChange={setView}
        onAdd={openAdd}
        onImport={() => setShowImport(true)}
        onReview={() => setShowReview(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      {/* Bannière migration */}
      {showMigrationBanner && (
        <div className="bg-violet-600 text-white px-6 py-3 flex items-center justify-between gap-4 shrink-0">
          <p className="text-sm font-medium">🗂️ {localCount} candidatures trouvées sur cet appareil — les importer dans le cloud ?</p>
          <button onClick={handleMigrate} disabled={migrating}
            className="shrink-0 bg-white text-violet-700 text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-violet-50 disabled:opacity-60">
            {migrating ? 'Import en cours…' : 'Importer'}
          </button>
        </div>
      )}

      {/* Vue principale */}
      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard
            candidatures={candidatures}
            onOpenGroup={setOpenGroup}
            onToggleGroupPriorite={setGroupPriorite}
          />
        ) : (
          <StatsView
            candidatures={candidatures}
            platforms={platforms}
            onUpdate={updatePlatform}
            onUpdateNom={updatePlatformNom}
            onAdd={addPlatform}
            onRemove={removePlatform}
          />
        )}
      </main>

      {/* Panneau détail entreprise */}
      {liveOpenGroup && (
        <CompanyDetail
          group={liveOpenGroup}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleGroupPriorite={setGroupPriorite}
          onClose={() => setOpenGroup(null)}
        />
      )}

      {/* Mode Review */}
      {showReview && (
        <ReviewMode
          candidatures={candidatures}
          startIndex={0}
          onUpdate={update}
          onTogglePriorite={togglePriorite}
          setGroupPriorite={setGroupPriorite}
          onClose={() => setShowReview(false)}
        />
      )}

      {/* Modal ajout/édition */}
      {modal && (
        <CandidatureModal
          initial={modal.mode === 'edit' ? modal.candidature : null}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Import Excel */}
      {showImport && (
        <ImportExcel onImport={importAll} onClose={() => setShowImport(false)} />
      )}

      {/* Confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-slate-900">Supprimer cette candidature ?</h3>
            <p className="text-sm text-slate-500">Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={32} className="animate-spin text-violet-500" />
    </div>
  )
}
