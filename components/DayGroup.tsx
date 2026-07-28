"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { TimeEntry, Label } from "@/lib/types"
import { formatHours, formatDayLabel } from "@/lib/timeUtils"
import { EntryCard } from "./EntryCard"

interface Props {
  date: string
  entries: TimeEntry[]
  onDelete: (id: string) => void
  onEdit: (entry: TimeEntry) => void
  labels: Label[]
}

export function DayGroup({ date, entries, onDelete, onEdit, labels }: Props) {
  const [open, setOpen] = useState(false)

  // Día con un solo registro: fila normal
  if (entries.length === 1) {
    return (
      <EntryCard
        entry={entries[0]}
        onDelete={onDelete}
        onEdit={onEdit}
        labels={labels}
      />
    )
  }

  // Día con varios registros: fila desplegable con el mismo formato
  const dayTotal = entries.reduce((sum, e) => sum + e.totalMinutes, 0)

  return (
    <div className="border-b border-border last:border-0">
      {/* Fila principal del día (igual formato que un día normal) */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 flex items-center gap-3 text-left"
        aria-expanded={open}
      >
        <div className="w-14 shrink-0">
          <p className="text-foreground text-sm font-mono capitalize">
            {formatDayLabel(date)}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans bg-primary/15 text-primary">
            {entries.length} registros
          </span>
        </div>

        <span className="text-primary font-mono text-sm font-bold shrink-0">
          {formatHours(dayTotal)}
        </span>

        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Registros individuales */}
      {open && (
        <div className="pl-3 mb-2 border-l-2 border-border">
          {entries.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={onDelete}
              onEdit={onEdit}
              labels={labels}
              registerIndex={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
