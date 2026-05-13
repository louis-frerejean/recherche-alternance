import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULTS = [
  'LinkedIn', 'Indeed', 'Welcome to the Jungle', 'APEC', 'HelloWork',
]

function fromDB(row) {
  return {
    id:          row.id,
    nom:         row.nom,
    total:       row.total       ?? 0,
    refus:       row.refus       ?? 0,
    sansReponse: row.sans_reponse ?? 0,
    entretiens:  row.entretiens  ?? 0,
  }
}

export function usePlatformStats(userId) {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('platform_stats')
      .select('*')
      .order('nom')

    if (!error) {
      if (!data?.length) {
        // Première ouverture : on seed les plateformes par défaut
        const rows = DEFAULTS.map(nom => ({ user_id: userId, nom, total: 0, refus: 0, sans_reponse: 0, entretiens: 0 }))
        await supabase.from('platform_stats').insert(rows)
        const { data: seeded } = await supabase.from('platform_stats').select('*').order('nom')
        setPlatforms(seeded?.map(fromDB) ?? [])
      } else {
        setPlatforms(data.map(fromDB))
      }
    }
    setLoading(false)
  }

  async function update(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    const col = field === 'sansReponse' ? 'sans_reponse' : field
    await supabase.from('platform_stats').update({ [col]: value }).eq('id', id)
  }

  async function updateNom(id, nom) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, nom } : p))
    await supabase.from('platform_stats').update({ nom }).eq('id', id)
  }

  async function add() {
    const { data } = await supabase
      .from('platform_stats')
      .insert({ user_id: userId, nom: '', total: 0, refus: 0, sans_reponse: 0, entretiens: 0 })
      .select().single()
    if (data) setPlatforms(prev => [...prev, fromDB(data)])
  }

  async function remove(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
    await supabase.from('platform_stats').delete().eq('id', id)
  }

  return { platforms, loading, update, updateNom, add, remove }
}
