import { useState, useEffect } from 'react'
import { supabase, fromDB, toDB } from '../lib/supabase'

export function useCandidatures(userId) {
  const [candidatures, setCandidatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('candidatures')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCandidatures(data.map(fromDB))
    setLoading(false)
  }

  async function add(data) {
    const newOne = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setCandidatures(prev => [newOne, ...prev]) // optimistic
    await supabase.from('candidatures').insert(toDB(newOne, userId))
    return newOne
  }

  async function update(id, data) {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    const current = candidatures.find(c => c.id === id)
    await supabase.from('candidatures').update(toDB({ ...current, ...data }, userId)).eq('id', id)
  }

  async function remove(id) {
    setCandidatures(prev => prev.filter(c => c.id !== id))
    await supabase.from('candidatures').delete().eq('id', id)
  }

  async function updateStatut(id, statut) {
    await update(id, { statut })
  }

  async function togglePriorite(id) {
    const c = candidatures.find(c => c.id === id)
    if (!c) return
    await update(id, { priorite: !c.priorite })
  }

  async function setGroupPriorite(ids, value) {
    const set = new Set(ids)
    setCandidatures(prev => prev.map(c => set.has(c.id) ? { ...c, priorite: value } : c))
    await supabase.from('candidatures').update({ priorite: value }).in('id', ids)
  }

  async function importAll(newList) {
    setCandidatures(newList)
    // Vide la table et réinsère tout
    await supabase.from('candidatures').delete().eq('user_id', userId)
    const rows = newList.map(c => toDB({ ...c, id: c.id ?? crypto.randomUUID() }, userId))
    await supabase.from('candidatures').insert(rows)
  }

  // Migration one-shot depuis localStorage
  async function migrateFromLocalStorage() {
    const LOCAL_KEY = 'alternance_candidatures_v2'
    const stored = localStorage.getItem(LOCAL_KEY)
    if (!stored) return false
    const local = JSON.parse(stored)
    if (!local?.length) return false
    await importAll(local)
    localStorage.removeItem(LOCAL_KEY)
    return true
  }

  return { candidatures, loading, add, update, remove, updateStatut, togglePriorite, setGroupPriorite, importAll, migrateFromLocalStorage }
}
