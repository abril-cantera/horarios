"use client"

import { useState, useEffect, useCallback } from "react"
import { TimeEntry, DayType } from "@/lib/types"
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
    (
      dates: string[],
      entryTime: string,
      exitTime: string,
      description?: string,
      labelId?: string,
      dayType?: DayType
    ) => {
      const minutes = calcMinutes(entryTime, exitTime)
      const newEntries: TimeEntry[] = dates.map((date) => ({
        id: `${date}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        date,
        entryTime,
        exitTime,
        totalMinutes: minutes,
        description: description?.trim() || undefined,
        labelId: labelId || undefined,
        dayType: dayType ?? "work",
      }))
      setEntries((prev) => {
        // Se permiten múltiples registros por día: solo agregamos
        return [...prev, ...newEntries]
      })
    },
    []
  )

  const updateEntry = useCallback(
    (
      id: string,
      entryTime: string,
      exitTime: string,
      description?: string,
      labelId?: string,
      dayType?: DayType
    ) => {
      const minutes = calcMinutes(entryTime, exitTime)
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                entryTime,
                exitTime,
                totalMinutes: minutes,
                description: description?.trim() || undefined,
                labelId: labelId || undefined,
                dayType: dayType ?? "work",
              }
            : e
        )
      )
    },
    []
  )

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { entries, addEntries, updateEntry, removeEntry, loaded }
}
