"use client"

import { useState, useEffect, useCallback } from "react"

export interface UserProfile {
  id: string
  name: string
  email: string
  passwordHash: string // stored as plain text locally (demo)
}

const STORAGE_KEY = "horario_user"
const STORAGE_SESSION = "horario_session"

function hashLike(s: string) {
  // Not real hashing — just for local demo purposes
  return btoa(s)
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const sessionId = localStorage.getItem(STORAGE_SESSION)
      if (sessionId) {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const u = JSON.parse(raw) as UserProfile
          if (u.id === sessionId) setUser(u)
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const saveUser = useCallback((u: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    localStorage.setItem(STORAGE_SESSION, u.id)
    setUser(u)
  }, [])

  const register = useCallback(
    (email: string, password: string, name?: string): { ok: boolean; error?: string } => {
      try {
        const existing = localStorage.getItem(STORAGE_KEY)
        if (existing) {
          const u = JSON.parse(existing) as UserProfile
          if (u.email.toLowerCase() === email.toLowerCase()) {
            return { ok: false, error: "Ya existe una cuenta con ese correo." }
          }
        }
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: name?.trim() || email.split("@")[0],
          email: email.toLowerCase().trim(),
          passwordHash: hashLike(password),
        }
        saveUser(newUser)
        return { ok: true }
      } catch {
        return { ok: false, error: "Error al registrar." }
      }
    },
    [saveUser]
  )

  const login = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { ok: false, error: "No hay cuenta registrada." }
        const u = JSON.parse(raw) as UserProfile
        if (u.email.toLowerCase() !== email.toLowerCase().trim()) {
          return { ok: false, error: "Correo o contraseña incorrectos." }
        }
        if (u.passwordHash !== hashLike(password)) {
          return { ok: false, error: "Correo o contraseña incorrectos." }
        }
        localStorage.setItem(STORAGE_SESSION, u.id)
        setUser(u)
        return { ok: true }
      } catch {
        return { ok: false, error: "Error al iniciar sesión." }
      }
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_SESSION)
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    (updates: { name?: string; email?: string; password?: string }): { ok: boolean; error?: string } => {
      if (!user) return { ok: false, error: "Sin sesión." }
      const updated: UserProfile = {
        ...user,
        name: updates.name?.trim() || user.name,
        email: updates.email?.toLowerCase().trim() || user.email,
        passwordHash: updates.password ? hashLike(updates.password) : user.passwordHash,
      }
      saveUser(updated)
      return { ok: true }
    },
    [user, saveUser]
  )

  const resetPassword = useCallback(
    (email: string): { ok: boolean; error?: string } => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { ok: false, error: "No hay cuenta con ese correo." }
        const u = JSON.parse(raw) as UserProfile
        if (u.email.toLowerCase() !== email.toLowerCase().trim()) {
          return { ok: false, error: "No hay cuenta con ese correo." }
        }
        // In a real app, send an email. Here we just confirm it "worked".
        return { ok: true }
      } catch {
        return { ok: false, error: "Error." }
      }
    },
    []
  )

  return { user, loaded, register, login, logout, updateProfile, resetPassword }
}
