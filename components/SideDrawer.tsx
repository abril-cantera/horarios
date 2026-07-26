"use client"

import { useState, useEffect } from "react"
import { X, Settings, Clock, BarChart2, Tag, LogOut, User, Check, Eye, EyeOff } from "lucide-react"
import type { UserProfile } from "@/hooks/use-auth"

type AppView = "horarios" | "informes" | "etiquetas"

interface Props {
  open: boolean
  onClose: () => void
  user: UserProfile
  activeView: AppView
  onNavigate: (v: AppView) => void
  onLogout: () => void
  onUpdateProfile: (updates: { name?: string; email?: string; password?: string }) => { ok: boolean; error?: string }
}

const NAV_ITEMS: { id: AppView; label: string; Icon: typeof Clock }[] = [
  { id: "horarios", label: "Registro de horas", Icon: Clock },
  { id: "informes", label: "Informe por mes", Icon: BarChart2 },
  { id: "etiquetas", label: "Etiquetas y servicios", Icon: Tag },
]

type ProfileSection = "name" | "email" | "password" | null

export function SideDrawer({ open, onClose, user, activeView, onNavigate, onLogout, onUpdateProfile }: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const [editing, setEditing] = useState<ProfileSection>(null)

  // Form states
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")

  // Sync form with user changes
  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
  }, [user])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const startEdit = (section: ProfileSection) => {
    setEditing(section)
    setProfileError("")
    setProfileSuccess("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleSave = (section: ProfileSection) => {
    setProfileError("")
    setProfileSuccess("")
    if (section === "name") {
      if (!name.trim()) { setProfileError("El nombre no puede estar vacio."); return }
      const res = onUpdateProfile({ name })
      if (res.ok) { setProfileSuccess("Nombre actualizado."); setEditing(null) }
      else setProfileError(res.error ?? "Error.")
    } else if (section === "email") {
      if (!email.trim()) { setProfileError("El correo no puede estar vacio."); return }
      const res = onUpdateProfile({ email })
      if (res.ok) { setProfileSuccess("Correo actualizado."); setEditing(null) }
      else setProfileError(res.error ?? "Error.")
    } else if (section === "password") {
      if (!newPassword) { setProfileError("Ingresa la nueva contrasena."); return }
      if (newPassword.length < 6) { setProfileError("Minimo 6 caracteres."); return }
      if (newPassword !== confirmPassword) { setProfileError("Las contrasenas no coinciden."); return }
      const res = onUpdateProfile({ password: newPassword })
      if (res.ok) { setProfileSuccess("Contrasena actualizada."); setEditing(null) }
      else setProfileError(res.error ?? "Error.")
    }
  }

  const handleNavigate = (v: AppView) => {
    onNavigate(v)
    setShowSettings(false)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu lateral"
      >
        {/* ─── Section 1: Header / Perfil ─── */}
        <div className="px-5 pt-12 pb-5 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground font-semibold text-sm font-sans truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs font-mono truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => { setShowSettings(v => !v); setEditing(null); setProfileError(""); setProfileSuccess("") }}
                className={`p-2 rounded-xl transition-colors ${showSettings ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                aria-label="Configuracion de perfil"
                aria-pressed={showSettings}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                aria-label="Cerrar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="space-y-3">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Nombre</label>
                  {editing !== "name" && (
                    <button onClick={() => startEdit("name")} className="text-xs text-primary font-mono hover:opacity-70">Editar</button>
                  )}
                </div>
                {editing === "name" ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSave("name") }}
                      autoFocus
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={() => handleSave("name")} className="p-1.5 text-primary hover:opacity-70" aria-label="Guardar"><Check className="w-4 h-4" /></button>
                    <button onClick={() => { setEditing(null); setName(user.name); setProfileError("") }} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Cancelar"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <p className="text-foreground text-sm font-sans truncate">{user.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Correo</label>
                  {editing !== "email" && (
                    <button onClick={() => startEdit("email")} className="text-xs text-primary font-mono hover:opacity-70">Editar</button>
                  )}
                </div>
                {editing === "email" ? (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSave("email") }}
                      autoFocus
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={() => handleSave("email")} className="p-1.5 text-primary hover:opacity-70" aria-label="Guardar"><Check className="w-4 h-4" /></button>
                    <button onClick={() => { setEditing(null); setEmail(user.email); setProfileError("") }} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label="Cancelar"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <p className="text-foreground text-sm font-mono truncate">{user.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Contrasena</label>
                  {editing !== "password" && (
                    <button onClick={() => startEdit("password")} className="text-xs text-primary font-mono hover:opacity-70">Cambiar</button>
                  )}
                </div>
                {editing === "password" ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Nueva contrasena"
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 pr-9 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                      />
                      <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSave("password") }}
                        placeholder="Confirmar contrasena"
                        className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 pr-9 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                      />
                      <button type="button" onClick={() => setShowConfPass(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSave("password")} className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium font-sans">Guardar</button>
                      <button onClick={() => { setEditing(null); setProfileError("") }} className="flex-1 py-1.5 bg-secondary text-foreground rounded-lg text-xs font-medium font-sans">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm font-mono">••••••••</p>
                )}
              </div>

              {/* Feedback */}
              {profileError && <p className="text-destructive text-xs font-sans">{profileError}</p>}
              {profileSuccess && <p className="text-primary text-xs font-sans">{profileSuccess}</p>}
            </div>
          )}
        </div>

        {/* ─── Section 2: Navigation ─── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider px-3 mb-3">Menu</p>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeView === id
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium font-sans transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* ─── Section 3: Logout ─── */}
        <div className="px-3 pb-8 pt-4 border-t border-border">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium font-sans text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  )
}
