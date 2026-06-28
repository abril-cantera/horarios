"use client"

import { Trash2 } from "lucide-react"
import { TimeEntry, Label } from "@/lib/types"
import { formatHours, formatDayLabel } from "@/lib/timeUtils"

interface Props {
  entry: TimeEntry
  onDelete: (id: string) => void
  labels: Label[]
}

export function EntryCard({ entry, onDelete, labels }: Props) {
  const label = entry.labelId ? labels.find(l => l.id === entry.labelId) : null

  return (
    <div className="py-3 border-b border-border last:border-0 group">
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="w-14 shrink-0">
          <p className="text-foreground text-sm font-mono capitalize">
            {formatDayLabel(entry.date)}
          </p>
        </div>

        {/* Times */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-foreground font-mono text-sm">{entry.entryTime}</span>
          <span className="text-muted-foreground text-xs">—</span>
          <span className="text-foreground font-mono text-sm">{entry.exitTime}</span>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <span className="text-primary font-mono text-sm font-bold">
            {formatHours(entry.totalMinutes)}
          </span>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(entry.id)}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-1 p-1 rounded"
          aria-label="Eliminar registro"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
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
