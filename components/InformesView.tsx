"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Moon, ShieldCheck, ShieldX, Ban, X } from "lucide-react"
import type { TimeEntry, Label } from "@/lib/types"
import {
  formatHours,
  formatHoursDecimal,
  getMonthKey,
  getMonthRange,
  addMonthsToKey,
  formatDayLabel,
} from "@/lib/timeUtils"
import { ABSENCE_TYPES, resolveAbsence, type AbsenceId } from "@/lib/absences"

const ABSENCE_ICONS: Record<AbsenceId, typeof Moon> = {
  franco: Moon,
  justificado: ShieldCheck,
  injustificado: ShieldX,
  suspension: Ban,
}

interface Props {
  entries: TimeEntry[]
  labels: Label[]
}

export function InformesView({ entries, labels }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()))
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceId | null>(null)

  const months = useMemo(() => getMonthRange(24, 12), [])
  const currentMonthKey = useMemo(() => getMonthKey(new Date()), [])

  const monthEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(selectedMonth)),
    [entries, selectedMonth]
  )

  const totalMinutes = useMemo(
    () => monthEntries.reduce((acc, e) => acc + e.totalMinutes, 0),
    [monthEntries]
  )

  const absenceCounts = useMemo(() => {
    const counts: Record<AbsenceId, number> = { franco: 0, justificado: 0, injustificado: 0, suspension: 0 }
    for (const e of monthEntries) {
      const a = resolveAbsence(e)
      if (a) counts[a.id]++
    }
    return counts
  }, [monthEntries])

  const totalAbsences =
    absenceCounts.franco + absenceCounts.justificado + absenceCounts.injustificado + absenceCounts.suspension
  const workedCount = monthEntries.length - totalAbsences

  const selectedLabel = months.find((m) => m.key === selectedMonth)?.label ?? selectedMonth
  const isCurrentMonth = selectedMonth === currentMonthKey

  // Entries filtered by selected absence type
  const absenceEntries = useMemo(() => {
    if (!selectedAbsence) return []
    return monthEntries
      .filter((e) => {
        const a = resolveAbsence(e)
        return a?.id === selectedAbsence
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [monthEntries, selectedAbsence])

  const selectedAbsenceType = selectedAbsence ? ABSENCE_TYPES.find((a) => a.id === selectedAbsence) : null

  return (
    <div className="space-y-5 pb-8">
      {/* Month Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { onSelectMonth(addMonthsToKey(selectedMonth, -1)); setSelectedAbsence(null) }}
          className="w-10 h-11 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setSelectedAbsence(null) }}
            className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-10 text-foreground font-sans text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer capitalize"
            aria-label="Seleccionar mes"
          >
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.key === currentMonthKey ? `${m.label} (actual)` : m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <button
          onClick={() => { onSelectMonth(addMonthsToKey(selectedMonth, 1)); setSelectedAbsence(null) }}
          className="w-10 h-11 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
            {isCurrentMonth ? "Este mes" : selectedLabel.split(" ")[0]}
          </p>
          <p className="text-primary text-3xl font-bold font-mono leading-none">
            {formatHoursDecimal(totalMinutes)}
            <span className="text-lg ml-1 text-muted-foreground font-normal">h</span>
          </p>
          <p className="text-muted-foreground text-xs font-mono">{formatHours(totalMinutes)}</p>
        </div>

        <div className="bg-secondary border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">Dias</p>
          <p className="text-foreground text-3xl font-bold font-mono leading-none">
            {workedCount}
            <span className="text-lg ml-1 text-muted-foreground font-normal">
              {workedCount === 1 ? "dia" : "dias"}
            </span>
          </p>
          <p className="text-muted-foreground text-xs font-mono">trabajados</p>
        </div>
      </div>

      {/* Absence type buttons (tap to filter) */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
          Tipos de ausencia — toca para ver registros
        </p>
        <div className="grid gap-2">
          {ABSENCE_TYPES.map((a) => {
            const Icon = ABSENCE_ICONS[a.id]
            const isActive = selectedAbsence === a.id
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAbsence((prev) => (prev === a.id ? null : a.id))}
                className="flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-all w-full"
                style={{
                  backgroundColor: isActive ? a.color + "22" : a.color + "14",
                  borderColor: isActive ? a.color : a.color + "40",
                }}
                aria-pressed={isActive}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: a.color }} />
                  <span className="text-sm font-medium font-sans" style={{ color: a.color }}>
                    {a.name}
                  </span>
                </span>
                <span className="font-mono font-bold text-lg" style={{ color: a.color }}>
                  {absenceCounts[a.id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filtered absence entries panel */}
      {selectedAbsence && selectedAbsenceType && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium font-sans" style={{ color: selectedAbsenceType.color }}>
              Registros: {selectedAbsenceType.name}
            </p>
            <button
              onClick={() => setSelectedAbsence(null)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              aria-label="Cerrar filtro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {absenceEntries.length === 0 ? (
            <div
              className="rounded-xl px-4 py-8 text-center border"
              style={{ backgroundColor: selectedAbsenceType.color + "10", borderColor: selectedAbsenceType.color + "30" }}
            >
              <p className="text-muted-foreground text-sm">
                No hay registros de {selectedAbsenceType.name.toLowerCase()} en {selectedLabel.split(" ")[0].toLowerCase()}.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border overflow-hidden divide-y"
              style={{ borderColor: selectedAbsenceType.color + "40" }}
            >
              {absenceEntries.map((entry) => {
                const entryLabel = entry.labelId ? labels.find((l) => l.id === entry.labelId) : null
                const AbsenceIcon = ABSENCE_ICONS[selectedAbsenceType.id]
                return (
                  <div
                    key={entry.id}
                    className="px-4 py-3"
                    style={{
                      backgroundColor: selectedAbsenceType.color + "08",
                      borderColor: selectedAbsenceType.color + "20",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 shrink-0">
                        <p className="text-foreground text-sm font-mono capitalize">
                          {formatDayLabel(entry.date)}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-sans"
                          style={{
                            backgroundColor: selectedAbsenceType.color + "22",
                            color: selectedAbsenceType.color,
                          }}
                        >
                          <AbsenceIcon className="w-3 h-3" />
                          {selectedAbsenceType.short}
                        </span>
                      </div>
                    </div>
                    {(entryLabel || entry.description) && (
                      <div className="mt-1.5 ml-[4.5rem] flex items-center gap-2 flex-wrap">
                        {entryLabel && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans"
                            style={{ backgroundColor: entryLabel.color + "22", color: entryLabel.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entryLabel.color }} />
                            {entryLabel.name}
                          </span>
                        )}
                        {entry.description && (
                          <p className="text-xs text-muted-foreground font-sans leading-relaxed truncate">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )

  function onSelectMonth(key: string) {
    setSelectedMonth(key)
  }
}
