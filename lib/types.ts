export interface Label {
  id: string
  name: string
  color: string // hex color
}

// Tipo de día: trabajado o alguno de los tipos de ausencia (0 horas)
export type DayType = "work" | "franco" | "justificado" | "injustificado"

export interface TimeEntry {
  id: string
  date: string // YYYY-MM-DD
  entryTime: string // HH:MM
  exitTime: string // HH:MM
  totalMinutes: number
  description?: string
  labelId?: string
  dayType?: DayType // undefined + 0 min => "franco" (compatibilidad hacia atrás)
}

export interface MonthGroup {
  key: string // YYYY-MM
  label: string
  entries: TimeEntry[]
  totalMinutes: number
}
