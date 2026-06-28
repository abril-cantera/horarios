"use client"

import { useState, useEffect, useCallback } from "react"
import { TimeEntry } from "@/lib/types"
import { calcMinutes } from "@/lib/timeUtils"

const STORAGE_KEY = "horario_entries"

export function useEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setEntries(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries, loaded])

  const addEntries = useCallback(
    (dates: string[], entryTime: string, exitTime: string, description?: string, labelId?: string) => {
      const minutes = calcMinutes(entryTime, exitTime)
      const newEntries: TimeEntry[] = dates.map((date) => ({
        id: `${date}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date,
        entryTime,
        exitTime,
        totalMinutes: minutes,
        description: description?.trim() || undefined,
        labelId: labelId || undefined,
      }))
      setEntries((prev) => {
        // Remove existing entries for same dates
        const filtered = prev.filter((e) => !dates.includes(e.date))
        return [...filtered, ...newEntries]
      })
    },
    []
  )

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { entries, addEntries, removeEntry, loaded }
}
