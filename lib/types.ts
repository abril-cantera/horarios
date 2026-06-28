export interface Label {
  id: string
  name: string
  color: string // hex color
}

export interface TimeEntry {
  id: string
  date: string // YYYY-MM-DD
  entryTime: string // HH:MM
  exitTime: string // HH:MM
  totalMinutes: number
  description?: string
  labelId?: string
}

export interface MonthGroup {
  key: string // YYYY-MM
  label: string
  entries: TimeEntry[]
  totalMinutes: number
}
