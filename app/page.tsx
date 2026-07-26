"use client"

import { useState, useMemo } from "react"
import { Menu, Clock, BarChart2, Tag } from "lucide-react"
import { useEntries } from "@/hooks/use-entries"
import { useLabels } from "@/hooks/use-labels"
import { useAuth } from "@/hooks/use-auth"
import { AddEntryModal } from "@/components/AddEntryModal"
import { AuthScreens } from "@/components/AuthScreens"
import { SideDrawer } from "@/components/SideDrawer"
import { HorariosView } from "@/components/HorariosView"
import { InformesView } from "@/components/InformesView"
import { EtiquetasView } from "@/components/EtiquetasView"
import type { TimeEntry, DayType } from "@/lib/types"

type AppView = "horarios" | "informes" | "etiquetas"

const VIEW_LABELS: Record<AppView, { label: string; Icon: typeof Clock }> = {
  horarios: { label: "Registro de horas", Icon: Clock },
  informes: { label: "Informe por mes", Icon: BarChart2 },
  etiquetas: { label: "Etiquetas y servicios", Icon: Tag },
}

export default function HomePage() {
  const { user, loaded: authLoaded, register, login, logout, updateProfile, resetPassword } = useAuth()
  const { entries, addEntries, updateEntry, removeEntry, loaded: entriesLoaded } = useEntries()
  const { labels, addLabel, removeLabel, updateLabel, loaded: labelsLoaded } = useLabels()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeView, setActiveView] = useState<AppView>("horarios")
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null)

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

  // Loading state
  if (!authLoaded || !entriesLoaded || !labelsLoaded) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    )
  }

  // Auth gate
  if (!user) {
    return (
      <AuthScreens
        onLogin={login}
        onRegister={(email, password) => register(email, password)}
        onReset={resetPassword}
      />
    )
  }

  const { label: viewLabel, Icon: ViewIcon } = VIEW_LABELS[activeView]

  return (
    <>
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={logout}
        onUpdateProfile={updateProfile}
      />

      <main className="min-h-screen bg-background font-sans">
        <div className="max-w-sm mx-auto px-4 pt-12 pb-28">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ViewIcon className="w-5 h-5 text-primary" />
                <h1 className="text-foreground font-bold text-2xl tracking-tight">{viewLabel}</h1>
              </div>
              <p className="text-muted-foreground text-sm font-mono">
                {user.name}
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Views */}
          {activeView === "horarios" && (
            <HorariosView
              entries={entries}
              labels={labels}
              onAdd={() => { setEditEntry(null); setShowModal(true) }}
              onEdit={handleEditEntry}
              onDelete={removeEntry}
            />
          )}

          {activeView === "informes" && (
            <InformesView
              entries={entries}
              labels={labels}
            />
          )}

          {activeView === "etiquetas" && (
            <EtiquetasView
              labels={labels}
              onAdd={addLabel}
              onDelete={removeLabel}
              onUpdate={updateLabel}
            />
          )}
        </div>
      </main>

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
    </>
  )
}
