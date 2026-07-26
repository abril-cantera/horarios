"use client"

import { useState, useMemo } from "react"
import { Plus, Search, X, Clock, Moon, ShieldCheck, ShieldX, Ban } from "lucide-react"
import type { TimeEntry, Label } from "@/lib/types"
import { resolveAbsence, type AbsenceId } from "@/lib/absences"
import { formatHours, formatDayLabel } from "@/lib/timeUtils"

const ABSENCE_ICONS: Record<AbsenceId, typeof Moon> = {
  franco: Moon,
  justificado: ShieldCheck,
  injustificado: ShieldX,
  suspension: Ban,
}

interface Props {
  entries: TimeEntry[]
  labels: Label[]
  onAdd: () => void
  onEdit: (entry: TimeEntry) => void
  onDelete: (id: string) => void
}

export function HorariosView({ entries, labels, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("")

  // Sort all entries newest first
  const allEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allEntries
    return allEntries.filter((e) => {
      // Match description
      if (e.description?.toLowerCase().includes(q)) return true
      // Match label name
      if (e.labelId) {
        const label = labels.find((l) => l.id === e.labelId)
        if (label?.name.toLowerCase().includes(q)) return true
      }
      // Match absence type name
      const absence = resolveAbsence(e)
      if (absence?.name.toLowerCase().includes(q)) return true
      if (absence?.short.toLowerCase().includes(q)) return true
      // Match date
      if (e.date.includes(q)) return true
      return false
    })
  }, [allEntries, search, labels])

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por etiqueta o descripcion..."
          className="w-full bg-card border border-border rounded-xl pl-9 pr-9 py-2.5 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpiar busqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Count */}
      {search && (
        <p className="text-muted-foreground text-xs font-mono">
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"} para &ldquo;{search}&rdquo;
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl px-6 py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
            {search ? <Search className="w-6 h-6 text-muted-foreground" /> : <Clock className="w-6 h-6 text-muted-foreground" />}
          </div>
          <p className="text-foreground text-sm font-medium">
            {search ? "Sin resultados" : "Sin registros"}
          </p>
          <p className="text-muted-foreground text-xs">
            {search
              ? "Proba con otro termino de busqueda"
              : "Presiona el boton + para cargar tu primer horario"}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {filtered.map((entry) => {
            const label = entry.labelId ? labels.find((l) => l.id === entry.labelId) : null
            const absence = resolveAbsence(entry)
            const AbsenceIcon = absence ? ABSENCE_ICONS[absence.id] : null

            return (
              <button
                key={entry.id}
                onClick={() => onEdit(entry)}
                className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  {/* Date */}
                  <div className="w-14 shrink-0">
                    <p className="text-foreground text-sm font-mono capitalize">
                      {formatDayLabel(entry.date)}
                    </p>
                  </div>

                  {/* Times or Absence */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {absence ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-sans"
                        style={{ backgroundColor: absence.color + "22", color: absence.color }}
                      >
                        {AbsenceIcon && <AbsenceIcon className="w-3 h-3" />}
                        {absence.short}
                      </span>
                    ) : (
                      <>
                        <span className="text-foreground font-mono text-sm">{entry.entryTime}</span>
                        <span className="text-muted-foreground text-xs">—</span>
                        <span className="text-foreground font-mono text-sm">{entry.exitTime}</span>
                      </>
                    )}
                  </div>

                  {/* Total */}
                  {!absence && (
                    <span className="text-primary font-mono text-sm font-bold shrink-0">
                      {formatHours(entry.totalMinutes)}
                    </span>
                  )}
                </div>

                {/* Label + Description */}
                {(label || entry.description) && (
                  <div className="mt-1.5 ml-[4.5rem] flex items-center gap-2 flex-wrap">
                    {label && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans"
                        style={{ backgroundColor: label.color + "22", color: label.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                        {label.name}
                      </span>
                    )}
                    {entry.description && (
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed truncate">
                        {entry.description}
                      </p>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={onAdd}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Agregar horario"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
