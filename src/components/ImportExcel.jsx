import { useRef, useState } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const STATUT_MAP = {
  "pas d'alternance": 'refus',
  "pas d'offre": 'refus',
  'refus': 'refus',
  'en attente': 'envoye',
  'envoy': 'envoye',
  'entretien': 'entretien',
  'rdv': 'entretien',
  'rappeler': 'relance',
  'relancer': 'relance',
  'rentrée': 'relance',
  'rentree': 'relance',
  'recontact': 'relance',
  'contacter': 'a_envoyer',
  'prendre rdv': 'a_envoyer',
}

function mapStatut(raw) {
  if (!raw || raw === '-') return 'a_envoyer'
  const s = raw.toLowerCase().trim()
  for (const [key, val] of Object.entries(STATUT_MAP)) {
    if (s.includes(key)) return val
  }
  return 'a_envoyer'
}

function excelDateToISO(serial) {
  if (!serial || serial === '-' || typeof serial !== 'number') return ''
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}

function parseContact(raw) {
  if (!raw || raw === '-') return { nom: '', email: '', tel: '' }
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l =>
    l && l !== '-' && !l.startsWith('image') && !l.startsWith('http')
  )
  const nom = lines[0] ?? ''
  const email = (lines.find(l => l.includes('@') && !l.startsWith('http')) ?? '').replace(/.*<(.+)>.*/, '$1').trim()
  const telLine = lines.find(l => /(\+33|0[0-9])[\s\-\.]?\d/.test(l)) ?? ''
  const tel = telLine.replace(/[^0-9+\s]/g, '').trim().slice(0, 20)
  return { nom, email, tel }
}

function convertRows(rows) {
  const candidatures = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue
    const entreprise = String(row[0] ?? '').trim()
    if (!entreprise || entreprise === '-') continue

    const contactRaw = String(row[1] ?? '').trim()
    const posteContact = String(row[2] ?? '').trim()
    const source = String(row[3] ?? '').trim()
    const dateContact = row[4]
    const statutRaw = String(row[5] ?? '').trim()
    const dateRelanceRaw = row[6]
    const notesRaw = String(row[7] ?? '').trim()

    const contact = parseContact(contactRaw)
    const noteParts = []
    if (source && source !== '-' && !source.startsWith('http')) noteParts.push(`Source : ${source}`)
    if (posteContact && posteContact !== '-' && !posteContact.startsWith('http')) noteParts.push(`Poste contact : ${posteContact}`)
    if (notesRaw && notesRaw !== '-') noteParts.push(notesRaw)

    const isUrl = source.startsWith('http') || /linkedin|welcome|annonce|offre en ligne/i.test(source)

    candidatures.push({
      id: crypto.randomUUID(),
      entreprise,
      poste: '',
      type: (!source || source === '-' || isUrl) ? 'classique' : 'spontanée',
      statut: mapStatut(statutRaw),
      dateCandidature: excelDateToISO(dateContact),
      dateRelance: excelDateToISO(dateRelanceRaw),
      dateEntretien: '',
      contact,
      lienOffre: source.startsWith('http') ? source : '',
      notes: noteParts.join('\n\n'),
      createdAt: new Date().toISOString(),
    })
  }
  return candidatures
}

export default function ImportExcel({ onImport, onClose }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const converted = convertRows(rows)
        if (converted.length === 0) {
          setError('Aucune candidature trouvée. Vérifie que le fichier a le bon format.')
          return
        }
        setPreview(converted)
      } catch {
        setError('Impossible de lire ce fichier Excel.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function handleConfirm() {
    if (preview) {
      onImport(preview)
      onClose()
    }
  }

  const byStatut = preview ? preview.reduce((acc, c) => {
    acc[c.statut] = (acc[c.statut] ?? 0) + 1
    return acc
  }, {}) : {}

  const LABELS = { a_envoyer: 'À envoyer', envoye: 'Envoyé', relance: 'Relancé', entretien: 'Entretien', refus: 'Refus', accepte: 'Accepté' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Importer depuis Excel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {!preview ? (
            <>
              <p className="text-sm text-slate-500">
                Sélectionne ton fichier Excel (.xlsx). Le format attendu est celui de ton tableau existant : Entreprise, Contact, Poste du contact, Source, Date, Statut, Date de relance, Notes.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl py-8 transition-colors cursor-pointer"
              >
                <Upload size={24} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Choisir un fichier .xlsx</span>
              </button>
              <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                <CheckCircle size={16} />
                <strong>{preview.length} candidatures</strong> détectées — prêtes à importer
              </div>
              <div className="flex flex-col gap-1.5">
                {Object.entries(byStatut).map(([statut, count]) => (
                  <div key={statut} className="flex justify-between text-sm text-slate-600 px-1">
                    <span>{LABELS[statut] ?? statut}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Ceci remplacera toutes les données actuelles.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Annuler
          </button>
          {preview && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Importer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
