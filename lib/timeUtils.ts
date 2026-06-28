import { TimeEntry, MonthGroup } from "./types"

export function calcMinutes(entry: string, exit: string): number {
  const [eh, em] = entry.split(":").map(Number)
  const [xh, xm] = exit.split(":").map(Number)
  const entryTotal = eh * 60 + em
  let exitTotal = xh * 60 + xm
  if (exitTotal < entryTotal) exitTotal += 24 * 60 // overnight
  return exitTotal - entryTotal
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m.toString().padStart(2, "0")}m`
}

export function formatHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(1)
}

export function groupByMonth(entries: TimeEntry[]): MonthGroup[] {
  const map = new Map<string, TimeEntry[]>()
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }

  const groups: MonthGroup[] = []
  for (const [key, list] of map.entries()) {
    const [year, month] = key.split("-").map(Number)
    const label = new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
    groups.push({
      key,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      entries: list.sort((a, b) => b.date.localeCompare(a.date)),
      totalMinutes: list.reduce((acc, e) => acc + e.totalMinutes, 0),
    })
  }

  return groups.sort((a, b) => b.key.localeCompare(a.key))
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function formatDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number)
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

export function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getLast12Months(): { key: string; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthKey(d)
    const label = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    result.push({ key, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return result
}
