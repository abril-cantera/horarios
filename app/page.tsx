"use client"

import { useState, useMemo } from "react"
import { Plus, Clock, Tag } from "lucide-react"
import { useEntries } from "@/hooks/use-entries"
import { useLabels } from "@/hooks/use-labels"
import { groupByMonth, getMonthKey } from "@/lib/timeUtils"
import { MonthSummary } from "@/components/MonthSummary"
import { MonthGroupSection } from "@/components/MonthGroupSection"
import { AddEntryModal } from "@/components/AddEntryModal"
import { LabelsSection } from "@/components/LabelsSection"
import { ThemeToggle } from "@/components/ThemeToggle"
import type { TimeEntry, DayType } from "@/lib/types"

type Tab = "horarios" | "etiquetas"

export default function HomePage() {
  const { entries, addEntries, updateEntry, removeEntry, loaded: entriesLoaded } = useEntries()
  const { labels, addLabel, removeLabel, updateLabel, loaded: labelsLoaded } = useLabels()
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()))
  const [activeTab, setActiveTab] = useState<Tab>("horarios")

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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-primary" />
              <h1 className="text-foreground font-bold text-2xl tracking-tight">Horarios</h1>
            </div>
            <p className="text-muted-foreground text-sm font-mono">Registro de horas trabajadas</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab("horarios")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium font-sans transition-all ${
              activeTab === "horarios"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Horarios
          </button>
          <button
            onClick={() => setActiveTab("etiquetas")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium font-sans transition-all ${
              activeTab === "etiquetas"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Etiquetas
            {labels.length > 0 && (
              <span className="ml-0.5 text-xs text-primary font-mono">({labels.length})</span>
            )}
          </button>
        </div>

        {/* Tab: Horarios */}
        {activeTab === "horarios" && (
          <div className="space-y-8">
            {/* Month Summary */}
            <MonthSummary
              entries={entries}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />

            {/* History */}
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
          </div>
        )}

        {/* Tab: Etiquetas */}
        {activeTab === "etiquetas" && (
          <LabelsSection
            labels={labels}
            onAdd={addLabel}
            onDelete={removeLabel}
            onUpdate={updateLabel}
          />
        )}
      </div>

      {/* FAB — solo en tab horarios */}
      {activeTab === "horarios" && (
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
