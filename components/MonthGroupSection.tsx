"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Layers } from "lucide-react"
import { MonthGroup, Label, TimeEntry } from "@/lib/types"
import { formatHours, formatDayLabel } from "@/lib/timeUtils"
import { EntryCard } from "./EntryCard"

// Agrupa registros consecutivos por fecha preservando el orden
function groupByDate(entries: TimeEntry[]): { date: string; entries: TimeEntry[] }[] {
  const map = new Map<string, TimeEntry[]>()
  const order: string[] = []
  for (const entry of entries) {
    if (!map.has(entry.date)) {
      map.set(entry.date, [])
      order.push(entry.date)
    }
    map.get(entry.date)!.push(entry)
  }
  return order.map(date => ({ date, entries: map.get(date)! }))
}

interface Props {
  group: MonthGroup
  onDelete: (id: string) => void
  onEdit: (entry: import("@/lib/types").TimeEntry) => void
  defaultOpen?: boolean
  labels: Label[]
}

export function MonthGroupSection({ group, onDelete, onEdit, defaultOpen = false, labels }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary/50 transition-colors"
        aria-expanded={open}
      >
        <div className="text-left">
          <p className="text-foreground font-medium text-sm font-sans capitalize">{group.label}</p>
          <p className="text-muted-foreground text-xs font-mono mt-0.5">
            {group.entries.length} {group.entries.length === 1 ? "registro" : "registros"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-primary font-bold font-mono text-lg">{formatHours(group.totalMinutes)}</span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Entries */}
      {open && (
        <div className="px-4 pb-2 border-t border-border">
          {groupByDate(group.entries).map(day => {
            const isMulti = day.entries.length > 1
            if (!isMulti) {
              const entry = day.entries[0]
              return (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  labels={labels}
                />
              )
            }

            const dayTotal = day.entries.reduce((sum, e) => sum + e.totalMinutes, 0)
            return (
              <div
                key={day.date}
                className="my-3 rounded-xl border border-border bg-secondary/40 overflow-hidden"
              >
                {/* Encabezado del día con varios registros */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-sans bg-primary/15 text-primary">
                      <Layers className="w-3 h-3" />
                      {day.entries.length} registros
                    </span>
                    <p className="text-foreground text-sm font-mono capitalize truncate">
                      {formatDayLabel(day.date)}
                    </p>
                  </div>
                  <span className="text-primary font-mono text-sm font-bold shrink-0">
                    {formatHours(dayTotal)}
                  </span>
                </div>

                {/* Registros del día */}
                <div className="px-3">
                  {day.entries.map((entry, i) => (
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
