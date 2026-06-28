"use client"

import { useMemo } from "react"
import { TimeEntry } from "@/lib/types"
import { formatHours, formatHoursDecimal, getMonthKey, getLast12Months } from "@/lib/timeUtils"
import { ChevronDown } from "lucide-react"

interface Props {
  entries: TimeEntry[]
  selectedMonth: string
  onSelectMonth: (key: string) => void
}

export function MonthSummary({ entries, selectedMonth, onSelectMonth }: Props) {
  const months = useMemo(() => getLast12Months(), [])
  const currentMonthKey = useMemo(() => getMonthKey(new Date()), [])

  const totalMinutes = useMemo(
    () =>
      entries
        .filter((e) => e.date.startsWith(selectedMonth))
        .reduce((acc, e) => acc + e.totalMinutes, 0),
    [entries, selectedMonth]
  )

  const currentMonthMinutes = useMemo(
    () =>
      entries
        .filter((e) => e.date.startsWith(currentMonthKey))
        .reduce((acc, e) => acc + e.totalMinutes, 0),
    [entries, currentMonthKey]
  )

  const isCurrentMonth = selectedMonth === currentMonthKey
  const selectedLabel = months.find((m) => m.key === selectedMonth)?.label ?? selectedMonth

  return (
    <div className="space-y-3">
      {/* Month Selector */}
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onSelectMonth(e.target.value)}
          className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-10 text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Selected month */}
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

        {/* Current month (only show if different from selected) */}
        {!isCurrentMonth ? (
          <div className="bg-secondary border border-border rounded-xl p-4 space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
              Mes actual
            </p>
            <p className="text-foreground text-3xl font-bold font-mono leading-none">
              {formatHoursDecimal(currentMonthMinutes)}
              <span className="text-lg ml-1 text-muted-foreground font-normal">h</span>
            </p>
            <p className="text-muted-foreground text-xs font-mono">
              {formatHours(currentMonthMinutes)}
            </p>
          </div>
        ) : (
          <div className="bg-secondary border border-border rounded-xl p-4 space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
              Registros
            </p>
            <p className="text-foreground text-3xl font-bold font-mono leading-none">
              {entries.filter((e) => e.date.startsWith(selectedMonth)).length}
              <span className="text-lg ml-1 text-muted-foreground font-normal">días</span>
            </p>
            <p className="text-muted-foreground text-xs font-mono">cargados</p>
          </div>
        )}
      </div>
    </div>
  )
}
