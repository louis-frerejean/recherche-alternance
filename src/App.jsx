import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import CandidatureModal from './components/CandidatureModal'
import CompanyDetail from './components/CompanyDetail'
import ImportExcel from './components/ImportExcel'
import ReviewMode from './components/ReviewMode'
import { useCandidatures } from './hooks/useCandidatures'
import { groupByCompany } from './utils/groupCandidatures'
import { Loader2 } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement, null = non connecté

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
  const {
    candidatures, loading,
    add, update, remove, updateStatut,
    togglePriorite, setGroupPriorite,
    importAll, migrateFromLocalStorage,
  } = useCandidatures(userId)

  const [modal, setModal] = useState(null)
  const [openGroup, setOpenGroup] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(null)
  const [migrated, setMigrated] = useState(false)

  // Migration one-shot depuis localStorage si des données y sont
  useEffect(() => {
    if (loading || migrated) return
    migrateFromLocalStorage().then(did => {
      if (did) setMigrated(true)
    })
  }, [loading])

  function openAdd() { setModal({ mode: 'add' }) }
  function openEdit(c) { setOpenGroup(null); setModal({ mode: 'edit', candidature: c }) }
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

  const reviewList = [...candidatures].sort((a, b) => (b.priorite ? 1 : 0) - (a.priorite ? 1 : 0))

  if (loading) return <Loader />

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        candidatures={candidatures}
        onAdd={openAdd}
        onImport={() => setShowImport(true)}
        onReview={() => setReviewIndex(0)}
        onLogout={() => supabase.auth.signOut()}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        <KanbanBoard
          candidatures={candidatures}
          onOpenGroup={setOpenGroup}
          onToggleGroupPriorite={setGroupPriorite}
        />
      </main>

      {liveOpenGroup && (
        <CompanyDetail
          group={liveOpenGroup}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleGroupPriorite={setGroupPriorite}
          onClose={() => setOpenGroup(null)}
        />
      )}

      {reviewIndex !== null && (
        <ReviewMode
          candidatures={reviewList}
          startIndex={reviewIndex}
          onUpdate={update}
          onTogglePriorite={togglePriorite}
          onClose={() => setReviewIndex(null)}
        />
      )}

      {modal && (
        <CandidatureModal
          initial={modal.mode === 'edit' ? modal.candidature : null}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {showImport && (
        <ImportExcel onImport={importAll} onClose={() => setShowImport(false)} />
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null) }}
        >
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
