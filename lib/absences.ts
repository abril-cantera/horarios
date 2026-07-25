import type { DayType, TimeEntry } from "./types"
import { FRANCO_COLOR, JUSTIFIED_COLOR, UNJUSTIFIED_COLOR, SUSPENSION_COLOR } from "./colors"

export type AbsenceId = Exclude<DayType, "work">

export interface AbsenceType {
  id: AbsenceId
  name: string // nombre completo
  short: string // etiqueta corta para el badge
  color: string // color único reservado
}

// Tipos de día de 0 horas. Cada uno tiene un color único.
export const ABSENCE_TYPES: AbsenceType[] = [
  { id: "franco", name: "Día franco", short: "FRANCO", color: FRANCO_COLOR },
  { id: "justificado", name: "Ausente justificado", short: "AUS. JUSTIF.", color: JUSTIFIED_COLOR },
  { id: "injustificado", name: "Ausente injustificado", short: "AUS. INJUSTIF.", color: UNJUSTIFIED_COLOR },
  { id: "suspension", name: "Suspensión", short: "SUSPENSIÓN", color: SUSPENSION_COLOR },
]

export function getAbsenceType(id?: string | null): AbsenceType | undefined {
  return ABSENCE_TYPES.find((a) => a.id === id)
}

// Resuelve el tipo de ausencia de un registro (0 horas).
// Devuelve undefined si es un día trabajado. Los registros antiguos de 0 min
// sin dayType se consideran "franco" por compatibilidad.
export function resolveAbsence(entry: TimeEntry): AbsenceType | undefined {
  if (entry.totalMinutes !== 0) return undefined
  const id = entry.dayType && entry.dayType !== "work" ? entry.dayType : "franco"
  return getAbsenceType(id)
}
