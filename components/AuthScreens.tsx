"use client"

import { useState } from "react"
import { Clock, Eye, EyeOff, ArrowLeft } from "lucide-react"

type AuthView = "login" | "register" | "reset"

interface Props {
  onLogin: (email: string, password: string) => { ok: boolean; error?: string }
  onRegister: (email: string, password: string) => { ok: boolean; error?: string }
  onReset: (email: string) => { ok: boolean; error?: string }
}

export function AuthScreens({ onLogin, onRegister, onReset }: Props) {
  const [view, setView] = useState<AuthView>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetForm = (v: AuthView) => {
    setView(v)
    setError("")
    setPassword("")
    setResetSent(false)
  }

  const handleLogin = () => {
    setError("")
    if (!email.trim() || !password) { setError("Completá todos los campos."); return }
    setLoading(true)
    const res = onLogin(email, password)
    setLoading(false)
    if (!res.ok) setError(res.error ?? "Error al iniciar sesión.")
  }

  const handleRegister = () => {
    setError("")
    if (!email.trim() || !password) { setError("Completá todos los campos."); return }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return }
    setLoading(true)
    const res = onRegister(email, password)
    setLoading(false)
    if (!res.ok) setError(res.error ?? "Error al registrarse.")
  }

  const handleReset = () => {
    setError("")
    if (!email.trim()) { setError("Ingresá tu correo."); return }
    setLoading(true)
    const res = onReset(email)
    setLoading(false)
    if (res.ok) { setResetSent(true) }
    else setError(res.error ?? "Error.")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      if (view === "login") handleLogin()
      else if (view === "register") handleRegister()
      else handleReset()
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg">
            <Clock className="w-8 h-8 text-primary-foreground" strokeWidth={2} />
          </div>
          <h1 className="text-foreground font-bold text-2xl tracking-tight">Horarios</h1>
          <p className="text-muted-foreground text-sm">Registro de horas trabajadas</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          {/* Title row */}
          <div className="flex items-center gap-2">
            {view !== "login" && (
              <button
                onClick={() => resetForm("login")}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                aria-label="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-foreground font-semibold text-lg">
              {view === "login" ? "Iniciar sesion" : view === "register" ? "Crear cuenta" : "Recuperar contrasena"}
            </h2>
          </div>

          {/* Reset sent confirmation */}
          {view === "reset" && resetSent ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-4 text-center space-y-1">
                <p className="text-primary text-sm font-medium">Revisa tu correo</p>
                <p className="text-muted-foreground text-xs">
                  Te enviamos un enlace a <strong>{email}</strong> para restablecer tu contrasena.
                </p>
              </div>
              <button
                onClick={() => resetForm("login")}
                className="w-full text-primary text-sm font-medium hover:opacity-70 transition-opacity py-2"
              >
                Volver al inicio de sesion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                  Correo electronico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="usuario@correo.com"
                  autoComplete="email"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Password (not shown on reset) */}
              {view !== "reset" && (
                <div className="space-y-1.5">
                  <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="••••••••"
                      autoComplete={view === "login" ? "current-password" : "new-password"}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-11 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label={showPass ? "Ocultar contrasena" : "Mostrar contrasena"}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-destructive text-xs font-sans px-1">{error}</p>
              )}

              {/* CTA */}
              <button
                onClick={view === "login" ? handleLogin : view === "register" ? handleRegister : handleReset}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm font-sans disabled:opacity-50 transition-opacity"
              >
                {loading
                  ? "..."
                  : view === "login"
                  ? "Ingresar"
                  : view === "register"
                  ? "Crear cuenta"
                  : "Enviar enlace"}
              </button>

              {/* Footer links */}
              {view === "login" && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <button
                    onClick={() => resetForm("reset")}
                    className="text-muted-foreground text-xs hover:text-primary transition-colors"
                  >
                    Olvide mi contrasena
                  </button>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>No tengo cuenta.</span>
                    <button
                      onClick={() => resetForm("register")}
                      className="text-primary font-medium hover:opacity-70 transition-opacity"
                    >
                      Registrarme
                    </button>
                  </div>
                </div>
              )}

              {view === "register" && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
                  <span>Ya tengo cuenta.</span>
                  <button
                    onClick={() => resetForm("login")}
                    className="text-primary font-medium hover:opacity-70 transition-opacity"
                  >
                    Iniciar sesion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
