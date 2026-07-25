"use client"

import { useState, useMemo } from "react"
import { Plus, Clock, Menu } from "lucide-react"
import { useEntries } from "@/hooks/use-entries"
import { useLabels } from "@/hooks/use-labels"
import { groupByMonth, getMonthKey } from "@/lib/timeUtils"
import { MonthSummary } from "@/components/MonthSummary"
import { MonthGroupSection } from "@/components/MonthGroupSection"
import { AddEntryModal } from "@/components/AddEntryModal"
import { LabelsSection } from "@/components/LabelsSection"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SideMenu, type MenuView } from "@/components/SideMenu"
import type { TimeEntry, DayType } from "@/lib/types"

const VIEW_TITLES: Record<MenuView, string> = {
  registro: "Registro de horas",
  informe: "Informe por mes",
  etiquetas: "Etiquetas",
}

export default function HomePage() {
  const { entries, addEntries, updateEntry, removeEntry, loaded: entriesLoaded } = useEntries()
  const { labels, addLabel, removeLabel, updateLabel, loaded: labelsLoaded } = useLabels()
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()))
  const [activeView, setActiveView] = useState<MenuView>("registro")
  const [menuOpen, setMenuOpen] = useState(false)

  const groups = useMemo(() => groupByMonth(entries), [entries])
  const existingDates = useMemo(() => entries.map((e) => e.date), [entries])

  const handleAddEntries = (
    dates: string[],
    entry: string,
    exit: string,
    description?: string,
    labelId?: string,
    dayType?: DayType
  ) => {
    addEntries(dates, entry, exit, description, labelId, dayType)
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditEntry(entry)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditEntry(null)
  }

  if (!entriesLoaded || !labelsLoaded) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="max-w-sm mx-auto px-4 pt-12 pb-28">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 -ml-1 rounded-lg flex items-center justify-center text-foreground hover:bg-secondary transition-colors shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-foreground font-bold text-xl tracking-tight truncate">
              {VIEW_TITLES[activeView]}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Vista: Registro de horas */}
        {activeView === "registro" && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
              Historial
            </p>

            {groups.length === 0 ? (
              <div className="bg-card border border-border rounded-xl px-6 py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-foreground text-sm font-medium">Sin registros</p>
                <p className="text-muted-foreground text-xs">
                  Presiona el boton + para cargar tu primer horario
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <MonthGroupSection
                  key={group.key}
                  group={group}
                  onDelete={removeEntry}
                  onEdit={handleEditEntry}
                  labels={labels}
                />
              ))
            )}
          </div>
        )}

        {/* Vista: Informe por mes */}
        {activeView === "informe" && (
          <MonthSummary
            entries={entries}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        )}

        {/* Vista: Etiquetas */}
        {activeView === "etiquetas" && (
          <LabelsSection
            labels={labels}
            onAdd={addLabel}
            onDelete={removeLabel}
            onUpdate={updateLabel}
          />
        )}
      </div>

      {/* FAB — solo en registro de horas */}
      {activeView === "registro" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={() => { setEditEntry(null); setShowModal(true) }}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Agregar horario"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Menú lateral */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
        labelCount={labels.length}
      />

      {/* Modal */}
      {showModal && (
        <AddEntryModal
          onClose={handleCloseModal}
          onAdd={handleAddEntries}
          onUpdate={updateEntry}
          existingDates={existingDates}
          labels={labels}
          onCreateLabel={addLabel}
          editEntry={editEntry}
        />
      )}
    </main>
  )
}
