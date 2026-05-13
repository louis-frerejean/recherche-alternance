import { readFileSync, writeFileSync } from 'fs'
import { createRequire } from 'module'
import { randomUUID } from 'crypto'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const EXCEL_PATH = "C:/Users/Frerejean Louis/OneDrive - SAS L'Ecole LDLC/Guardia/Recherche alternance/Suivi de candidatures.xlsx"

function excelDateToISO(serial) {
  if (!serial || serial === '-' || typeof serial !== 'number') return ''
  // Excel serial: days since 1900-01-01 (with the famous leap year bug)
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}

function mapStatut(raw) {
  if (!raw || raw === '-') return 'a_envoyer'
  const s = raw.toLowerCase().trim()
  if (s.includes("pas d'alternance") || s.includes("pas d'offre") || s.includes('refus')) return 'refus'
  if (s.includes('en attente') || s.includes('envoy')) return 'envoye'
  if (s.includes('entretien') || s.includes('rdv') || s.includes('rencontre')) return 'entretien'
  if (s.includes('rappeler') || s.includes('relancer')) return 'relance'
  if (s.includes('rentrée') || s.includes('rentree') || s.includes('recontact')) return 'relance'
  if (s.includes('contacter') || s.includes('prendre rdv')) return 'a_envoyer'
  return 'a_envoyer'
}

function parseContact(raw, posteContact) {
  if (!raw || raw === '-') return { nom: '', email: '', tel: '' }

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && l !== '-' && !l.startsWith('image') && !l.startsWith('Parc') && !l.startsWith('72 ') && !l.startsWith('9,'))

  const nom = lines[0] ?? ''
  const emailLine = lines.find(l => l.includes('@') && !l.startsWith('http'))
  const email = emailLine
    ? emailLine.replace(/.*<(.+)>.*/, '$1').trim()
    : ''

  const telLine = lines.find(l => /(\+33|0[0-9])[\s\-\.]?\d/.test(l))
  const tel = telLine
    ? telLine.replace(/[^0-9+\s]/g, '').trim().slice(0, 20)
    : ''

  return { nom, email, tel }
}

function isEmptyRow(row) {
  return !row || row.length === 0 || row.every(c => !c || c === '-')
}

const wb = XLSX.readFile(EXCEL_PATH)
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

const candidatures = []

for (let i = 1; i < rows.length; i++) {
  const row = rows[i]
  if (isEmptyRow(row)) continue

  const entreprise = String(row[0] ?? '').trim()
  if (!entreprise || entreprise === '-') continue

  const contactRaw = String(row[1] ?? '').trim()
  const posteContact = String(row[2] ?? '').trim()
  const source = String(row[3] ?? '').trim()
  const dateContact = row[4]
  const statutRaw = String(row[5] ?? '').trim()
  const dateRelanceRaw = row[6]
  const notesRaw = String(row[7] ?? '').trim()

  const contact = parseContact(contactRaw, posteContact)

  // Build notes: combine source, poste contact, notes
  const noteParts = []
  if (source && source !== '-' && !source.startsWith('http')) noteParts.push(`Source : ${source}`)
  if (posteContact && posteContact !== '-' && !posteContact.startsWith('http')) noteParts.push(`Poste contact : ${posteContact}`)
  if (notesRaw && notesRaw !== '-') noteParts.push(notesRaw)
  const notes = noteParts.join('\n\n')

  // Determine type: spontanée if source is a person's name (not a URL/site)
  const isUrl = source.startsWith('http') || source.toLowerCase().includes('linkedin') || source.toLowerCase().includes('welcome') || source.toLowerCase().includes('annonce') || source.toLowerCase().includes('offre en ligne')
  const type = (!source || source === '-' || isUrl) ? 'classique' : 'spontanée'

  candidatures.push({
    id: randomUUID(),
    entreprise,
    poste: '',
    type,
    statut: mapStatut(statutRaw),
    dateCandidature: excelDateToISO(dateContact),
    dateRelance: excelDateToISO(dateRelanceRaw),
    dateEntretien: '',
    contact,
    lienOffre: source.startsWith('http') ? source : '',
    notes,
    createdAt: new Date().toISOString(),
  })
}

writeFileSync('./scripts/candidatures.json', JSON.stringify(candidatures, null, 2))
console.log(`✅ ${candidatures.length} candidatures converties → scripts/candidatures.json`)

// Afficher un résumé
const byStatut = {}
for (const c of candidatures) {
  byStatut[c.statut] = (byStatut[c.statut] ?? 0) + 1
}
console.log('Répartition par statut :')
for (const [k, v] of Object.entries(byStatut)) {
  console.log(`  ${k}: ${v}`)
}
