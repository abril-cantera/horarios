"use client"

import { useEffect } from "react"
import { Clock, CalendarRange, Tag, Settings, LogOut, X, User } from "lucide-react"

export type MenuView = "registro" | "informe" | "etiquetas"

interface NavOption {
  id: MenuView
  label: string
  icon: typeof Clock
}

const NAV_OPTIONS: NavOption[] = [
  { id: "registro", label: "Registro de horas", icon: Clock },
  { id: "informe", label: "Informe por mes", icon: CalendarRange },
  { id: "etiquetas", label: "Etiquetas", icon: Tag },
]

interface SideMenuProps {
  open: boolean
  onClose: () => void
  activeView: MenuView
  onSelectView: (view: MenuView) => void
  labelCount: number
  onSettings?: () => void
  onLogout?: () => void
}

export function SideMenu({
  open,
  onClose,
  activeView,
  onSelectView,
  labelCount,
  onSettings,
  onLogout,
}: SideMenuProps) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer: se despliega de izquierda a derecha */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw] flex-col bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Parte superior: cuenta + configuración */}
        <div className="flex items-center justify-between gap-3 px-4 py-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Mi cuenta</p>
              <p className="text-xs font-mono text-muted-foreground truncate">Sesión activa</p>
            </div>
          </div>
          <button
            onClick={onSettings}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Parte media: opciones de navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const active = activeView === opt.id
              return (
                <li key={opt.id}>
                  <button
                    onClick={() => {
                      onSelectView(opt.id)
                      onClose()
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium font-sans transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left">{opt.label}</span>
                    {opt.id === "etiquetas" && labelCount > 0 && (
                      <span className="text-xs font-mono text-muted-foreground">{labelCount}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Parte inferior: salir */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium font-sans text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left">Salir</span>
          </button>
        </div>

        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-3 sr-only"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>
    </>
  )
}
