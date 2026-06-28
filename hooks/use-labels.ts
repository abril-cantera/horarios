"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/lib/types"

const STORAGE_KEY = "horario_labels"

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLabels(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels))
  }, [labels, loaded])

  const addLabel = useCallback((name: string, color: string) => {
    const newLabel: Label = {
      id: `label-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      color,
    }
    setLabels((prev) => [...prev, newLabel])
    return newLabel.id
  }, [])

  const removeLabel = useCallback((id: string) => {
    setLabels((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateLabel = useCallback((id: string, name: string, color: string) => {
    setLabels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name: name.trim(), color } : l))
    )
  }, [])

  return { labels, addLabel, removeLabel, updateLabel, loaded }
}
