import { useState, useEffect } from 'react'
import INITIAL_DATA from '../data/initial.json'

const STORAGE_KEY = 'alternance_candidatures_v2'

export function useCandidatures() {
  const [candidatures, setCandidatures] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
      return INITIAL_DATA
    } catch {
      return INITIAL_DATA
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidatures))
  }, [candidatures])

  function add(data) {
    const newOne = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setCandidatures(prev => [newOne, ...prev])
    return newOne
  }

  function update(id, data) {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  function remove(id) {
    setCandidatures(prev => prev.filter(c => c.id !== id))
  }

  function updateStatut(id, statut) {
    update(id, { statut })
  }

  function togglePriorite(id) {
    setCandidatures(prev => prev.map(c => c.id === id ? { ...c, priorite: !c.priorite } : c))
  }

  function importAll(newList) {
    setCandidatures(newList)
  }

  return { candidatures, add, update, remove, updateStatut, togglePriorite, importAll }
}
