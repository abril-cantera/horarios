"use client"

import { useMemo } from "react"
import { TimeEntry } from "@/lib/types"
import {
  formatHours,
  formatHoursDecimal,
  getMonthKey,
  getMonthRange,
  addMonthsToKey,
} from "@/lib/timeUtils"
import { FRANCO_COLOR } from "@/lib/colors"
import { ChevronDown, ChevronLeft, ChevronRight, Moon } from "lucide-react"

interface Props {
  entries: TimeEntry[]
  selectedMonth: string
  onSelectMonth: (key: string) => void
}

export function MonthSummary({ entries, selectedMonth, onSelectMonth }: Props) {
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

  const francoCount = useMemo(
    () => monthEntries.filter((e) => e.totalMinutes === 0).length,
    [monthEntries]
  )

  const workedCount = monthEntries.length - francoCount

  const isCurrentMonth = selectedMonth === currentMonthKey
  const selectedLabel = months.find((m) => m.key === selectedMonth)?.label ?? selectedMonth

  return (
    <div className="space-y-3">
      {/* Month Selector con navegación */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectMonth(addMonthsToKey(selectedMonth, -1))}
          className="w-10 h-11 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
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
          onClick={() => onSelectMonth(addMonthsToKey(selectedMonth, 1))}
          className="w-10 h-11 shrink-0 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Horas del mes seleccionado */}
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

        {/* Días trabajados */}
        <div className="bg-secondary border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-mono">
            Días
          </p>
          <p className="text-foreground text-3xl font-bold font-mono leading-none">
            {workedCount}
            <span className="text-lg ml-1 text-muted-foreground font-normal">
              {workedCount === 1 ? "día" : "días"}
            </span>
          </p>
          <p className="text-muted-foreground text-xs font-mono">trabajados</p>
        </div>
      </div>

      {/* Conteo de francos */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3 border"
        style={{ backgroundColor: FRANCO_COLOR + "14", borderColor: FRANCO_COLOR + "40" }}
      >
        <span className="flex items-center gap-2">
          <Moon className="w-4 h-4" style={{ color: FRANCO_COLOR }} />
          <span className="text-sm font-medium font-sans" style={{ color: FRANCO_COLOR }}>
            Francos
          </span>
        </span>
        <span className="font-mono font-bold text-lg" style={{ color: FRANCO_COLOR }}>
          {francoCount}
        </span>
      </div>
    </div>
  )
}
