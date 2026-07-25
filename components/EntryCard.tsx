"use client"

import { Trash2, Pencil, Moon, ShieldCheck, ShieldX, Ban } from "lucide-react"
import { TimeEntry, Label } from "@/lib/types"
import { formatHours, formatDayLabel } from "@/lib/timeUtils"
import { resolveAbsence, type AbsenceId } from "@/lib/absences"

const ABSENCE_ICONS: Record<AbsenceId, typeof Moon> = {
  franco: Moon,
  justificado: ShieldCheck,
  injustificado: ShieldX,
  suspension: Ban,
}

interface Props {
  entry: TimeEntry
  onDelete: (id: string) => void
  onEdit: (entry: TimeEntry) => void
  labels: Label[]
}

export function EntryCard({ entry, onDelete, onEdit, labels }: Props) {
  const label = entry.labelId ? labels.find(l => l.id === entry.labelId) : null
  const absence = resolveAbsence(entry)
  const AbsenceIcon = absence ? ABSENCE_ICONS[absence.id] : null

  return (
    <div className="py-3 border-b border-border last:border-0">
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
          <div className="text-right shrink-0">
            <span className="text-primary font-mono text-sm font-bold">
              {formatHours(entry.totalMinutes)}
            </span>
          </div>
        )}

        {/* Actions — siempre visibles (app móvil) */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onEdit(entry)}
            className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg active:bg-secondary"
            aria-label="Editar registro"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg active:bg-secondary"
            aria-label="Eliminar registro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Label + Description */}
      {(label || entry.description) && (
        <div className="mt-1.5 ml-[4.5rem] flex items-center gap-2 flex-wrap">
          {label && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-sans"
              style={{
                backgroundColor: label.color + "22",
                color: label.color,
              }}
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
    </div>
  )
}
