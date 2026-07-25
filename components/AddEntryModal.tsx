"use client"

import { useState, useMemo } from "react"
import { X, ChevronLeft, ChevronRight, Check, Tag, Plus, Moon, ShieldCheck, ShieldX, Ban } from "lucide-react"
import { calcMinutes, formatHours, getDaysInMonth, formatDateStr } from "@/lib/timeUtils"
import { LABEL_COLORS } from "@/lib/colors"
import { ABSENCE_TYPES, type AbsenceId } from "@/lib/absences"
import { Label, TimeEntry } from "@/lib/types"

const ABSENCE_ICONS: Record<AbsenceId, typeof Moon> = {
  franco: Moon,
  justificado: ShieldCheck,
  injustificado: ShieldX,
  suspension: Ban,
}

interface Props {
  onClose: () => void
  onAdd: (dates: string[], entry: string, exit: string, description?: string, labelId?: string, dayType?: import("@/lib/types").DayType) => void
  onUpdate?: (id: string, entry: string, exit: string, description?: string, labelId?: string, dayType?: import("@/lib/types").DayType) => void
  existingDates: string[]
  labels: Label[]
  onCreateLabel: (name: string, color: string) => string
  editEntry?: TimeEntry | null
}

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]

function getWeekdayIndex(d: Date) {
  return (d.getDay() + 6) % 7
}

export function AddEntryModal({
  onClose,
  onAdd,
  onUpdate,
  existingDates,
  labels,
  onCreateLabel,
  editEntry,
}: Props) {
  const isEditing = !!editEntry
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [selectedDates, setSelectedDates] = useState<string[]>(
    editEntry ? [editEntry.date] : []
  )
  const [entryTime, setEntryTime] = useState(editEntry?.entryTime ?? "09:00")
  const [exitTime, setExitTime] = useState(editEntry?.exitTime ?? "18:00")
  const [description, setDescription] = useState(editEntry?.description ?? "")
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(
    editEntry?.labelId ?? null
  )
  const [absence, setAbsence] = useState<AbsenceId | null>(
    editEntry && editEntry.totalMinutes === 0
      ? ((editEntry.dayType && editEntry.dayType !== "work" ? editEntry.dayType : "franco") as AbsenceId)
      : null
  )
  const [step, setStep] = useState<"days" | "time">(isEditing ? "time" : "days")

  // New label inline creation
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState("")
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])

  const days = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth])

  const totalMinutes = useMemo(() => {
    if (absence || !entryTime || !exitTime) return 0
    return calcMinutes(entryTime, exitTime)
  }, [entryTime, exitTime, absence])

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const toggleDay = (d: Date) => {
    const key = formatDateStr(d)
    setSelectedDates(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    )
  }

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString("es-ES", {
    month: "long", year: "numeric"
  })

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    const id = onCreateLabel(newLabelName, newLabelColor)
    setSelectedLabelId(id)
    setShowNewLabel(false)
    setNewLabelName("")
    setNewLabelColor(LABEL_COLORS[0])
  }

  const handleSubmit = () => {
    // Cuando es una ausencia, guardamos 00:00 - 00:00 => 0 horas
    const entry = absence ? "00:00" : entryTime
    const exit = absence ? "00:00" : exitTime
    const dayType = absence ?? "work"

    if (isEditing && editEntry && onUpdate) {
      onUpdate(editEntry.id, entry, exit, description, selectedLabelId ?? undefined, dayType)
      onClose()
      return
    }

    if (selectedDates.length === 0) return
    onAdd(selectedDates, entry, exit, description, selectedLabelId ?? undefined, dayType)
    onClose()
  }

  const canSave = absence !== null || totalMinutes > 0

  const firstDay = getWeekdayIndex(days[0])
  const calendarCells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...days,
  ]
  while (calendarCells.length % 7 !== 0) calendarCells.push(null)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-card border border-border rounded-t-3xl p-6 pb-8 space-y-5 max-h-[92dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-foreground font-bold text-lg font-sans">
            {isEditing ? "Editar registro" : step === "days" ? "Seleccionar días" : "Horario"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "days" && !isEditing && (
          <>
            {/* Month nav */}
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Mes anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-foreground text-sm font-medium capitalize font-sans">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
              </span>
              <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Mes siguiente">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-mono py-1">{d}</div>
              ))}
              {calendarCells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />
                const key = formatDateStr(d)
                const isSelected = selectedDates.includes(key)
                const hasEntry = existingDates.includes(key)
                const isToday = formatDateStr(today) === key
                return (
                  <button
                    key={key}
                    onClick={() => toggleDay(d)}
                    className={`
                      relative h-9 w-full rounded-lg text-sm font-mono flex items-center justify-center transition-all
                      ${isSelected
                        ? "bg-primary text-primary-foreground font-bold"
                        : isToday
                        ? "border border-primary text-primary"
                        : "text-foreground hover:bg-secondary"
                      }
                    `}
                    aria-label={key}
                    aria-pressed={isSelected}
                  >
                    {d.getDate()}
                    {hasEntry && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>

            {selectedDates.length > 0 && (
              <p className="text-center text-sm text-muted-foreground font-mono">
                {selectedDates.length} {selectedDates.length === 1 ? "día seleccionado" : "días seleccionados"}
              </p>
            )}

            <button
              onClick={() => setStep("time")}
              disabled={selectedDates.length === 0}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium text-sm disabled:opacity-30 transition-opacity font-sans"
            >
              Continuar
            </button>
          </>
        )}

        {step === "time" && (
          <>
            {/* Summary of selected days */}
            <div className="bg-secondary rounded-xl px-4 py-3">
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-1">
                {isEditing ? "Editando" : "Días seleccionados"}
              </p>
              <p className="text-foreground text-sm font-mono">
                {isEditing
                  ? editEntry?.date
                  : `${selectedDates.length} ${selectedDates.length === 1 ? "día" : "días"}`}
              </p>
            </div>

            {/* Absence type selector (0 horas) */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                Día sin horas
              </p>
              <div className="grid gap-2">
                {ABSENCE_TYPES.map((a) => {
                  const Icon = ABSENCE_ICONS[a.id]
                  const active = absence === a.id
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAbsence((prev) => (prev === a.id ? null : a.id))}
                      className="w-full flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-all font-sans"
                      style={{
                        borderColor: active ? a.color : "var(--border)",
                        backgroundColor: active ? a.color + "1a" : "var(--secondary)",
                      }}
                      aria-pressed={active}
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className="w-4 h-4"
                          style={{ color: active ? a.color : "var(--muted-foreground)" }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: active ? a.color : "var(--foreground)" }}
                        >
                          {a.name}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">0h</span>
                      </span>
                      {active && (
                        <Check className="w-4 h-4" style={{ color: a.color }} strokeWidth={3} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {!absence && (
              <>
                {/* Time inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Entrada</label>
                    <input
                      type="time"
                      value={entryTime}
                      onChange={e => setEntryTime(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Salida</label>
                    <input
                      type="time"
                      value={exitTime}
                      onChange={e => setExitTime(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Preview total */}
                {totalMinutes > 0 && (
                  <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-1">Total por día</p>
                    <p className="text-primary text-2xl font-bold font-mono">{formatHours(totalMinutes)}</p>
                  </div>
                )}
              </>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                Descripcion <span className="normal-case text-muted-foreground/50">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: trabajo remoto, guardia, viaje..."
                rows={2}
                maxLength={120}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Label picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Etiqueta <span className="normal-case text-muted-foreground/50">(opcional)</span>
                </label>
                <button
                  onClick={() => setShowNewLabel(v => !v)}
                  className="text-xs text-primary font-mono flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  <Plus className="w-3 h-3" />
                  Nueva
                </button>
              </div>

              {/* Inline new label form */}
              {showNewLabel && (
                <div className="bg-secondary border border-border rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={e => setNewLabelName(e.target.value)}
                    placeholder="Nombre de etiqueta..."
                    maxLength={30}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                  />
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs font-mono">Color</span>
                    <div className="flex gap-2 flex-wrap">
                      {LABEL_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewLabelColor(c)}
                          className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                        >
                          {newLabelColor === c && <Check className="w-3 h-3 text-black/70" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCreateLabel}
                    disabled={!newLabelName.trim()}
                    className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-30 transition-opacity font-sans"
                  >
                    Crear etiqueta
                  </button>
                </div>
              )}

              {/* Existing labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => {
                    const isSelected = selectedLabelId === label.id
                    return (
                      <button
                        key={label.id}
                        onClick={() => setSelectedLabelId(isSelected ? null : label.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans border-2 transition-all ${
                          isSelected ? "border-transparent" : "border-transparent opacity-60 hover:opacity-90"
                        }`}
                        style={{
                          backgroundColor: isSelected ? label.color + "33" : label.color + "1a",
                          borderColor: isSelected ? label.color : "transparent",
                          color: label.color,
                        }}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              )}

              {labels.length === 0 && !showNewLabel && (
                <p className="text-muted-foreground text-xs font-mono">
                  No hay etiquetas. Crea una con &ldquo;Nueva&rdquo;.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => (isEditing ? onClose() : setStep("days"))}
                className="bg-secondary text-foreground rounded-xl py-3 font-medium text-sm transition-colors font-sans"
              >
                {isEditing ? "Cancelar" : "Volver"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSave}
                className="bg-primary text-primary-foreground rounded-xl py-3 font-medium text-sm disabled:opacity-30 transition-opacity flex items-center justify-center gap-2 font-sans"
              >
                <Check className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
