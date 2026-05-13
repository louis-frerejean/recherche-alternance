import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STATUTS } from './StatusBadge'

const EMPTY = {
  entreprise: '',
  poste: '',
  type: 'classique',
  statut: 'a_envoyer',
  dateCandidature: '',
  dateRelance: '',
  dateEntretien: '',
  contact: { nom: '', email: '', tel: '' },
  lienOffre: '',
  notes: '',
}

function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white'

export default function CandidatureModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial, contact: { ...EMPTY.contact, ...initial.contact } } : EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function setContact(field, value) {
    setForm(f => ({ ...f, contact: { ...f.contact, [field]: value } }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.entreprise.trim()) { setError('Le nom de l\'entreprise est requis.'); return }
    if (!form.poste.trim()) { setError('L\'intitulé du poste est requis.'); return }
    onSave(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {initial ? 'Modifier la candidature' : 'Nouvelle candidature'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {/* Entreprise + Poste */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entreprise" required>
              <input className={inputCls} value={form.entreprise} onChange={e => set('entreprise', e.target.value)} placeholder="Capgemini" />
            </Field>
            <Field label="Poste" required>
              <input className={inputCls} value={form.poste} onChange={e => set('poste', e.target.value)} placeholder="Développeur Full Stack" />
            </Field>
          </div>

          {/* Type + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="classique">Classique</option>
                <option value="spontanée">Spontanée</option>
              </select>
            </Field>
            <Field label="Statut">
              <select className={inputCls} value={form.statut} onChange={e => set('statut', e.target.value)}>
                {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date candidature">
              <input type="date" className={inputCls} value={form.dateCandidature} onChange={e => set('dateCandidature', e.target.value)} />
            </Field>
            <Field label="Date relance">
              <input type="date" className={inputCls} value={form.dateRelance} onChange={e => set('dateRelance', e.target.value)} />
            </Field>
            <Field label="Date entretien">
              <input type="date" className={inputCls} value={form.dateEntretien} onChange={e => set('dateEntretien', e.target.value)} />
            </Field>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Contact</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nom">
                <input className={inputCls} value={form.contact.nom} onChange={e => setContact('nom', e.target.value)} placeholder="Marie Dupont" />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.contact.email} onChange={e => setContact('email', e.target.value)} placeholder="rh@entreprise.com" />
              </Field>
              <Field label="Téléphone">
                <input className={inputCls} value={form.contact.tel} onChange={e => setContact('tel', e.target.value)} placeholder="06 …" />
              </Field>
            </div>
          </div>

          {/* Lien offre */}
          <Field label="Lien de l'offre">
            <input className={inputCls} value={form.lienOffre} onChange={e => set('lienOffre', e.target.value)} placeholder="https://..." />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Infos utiles, retours, impressions…"
            />
          </Field>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm transition-colors"
          >
            {initial ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
