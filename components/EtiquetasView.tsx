"use client"

import { useState } from "react"
import { Trash2, Check, Pencil, Plus, Tag, Lock, Moon, ShieldCheck, ShieldX, Ban } from "lucide-react"
import type { Label } from "@/lib/types"
import { LABEL_COLORS } from "@/lib/colors"
import { ABSENCE_TYPES, type AbsenceId } from "@/lib/absences"

const ABSENCE_ICONS: Record<AbsenceId, typeof Moon> = {
  franco: Moon,
  justificado: ShieldCheck,
  injustificado: ShieldX,
  suspension: Ban,
}

interface Props {
  labels: Label[]
  onAdd: (name: string, color: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, name: string, color: string) => void
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LABEL_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center shrink-0"
          style={{ backgroundColor: c }}
          aria-label={c}
        >
          {value === c && <Check className="w-3.5 h-3.5 text-black/70" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}

export function EtiquetasView({ labels, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(LABEL_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState(LABEL_COLORS[0])

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName, newColor)
    setNewName("")
    setNewColor(LABEL_COLORS[0])
    setShowForm(false)
  }

  const startEdit = (label: Label) => {
    setEditingId(label.id)
    setEditName(label.name)
    setEditColor(label.color)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return
    onUpdate(editingId, editName, editColor)
    setEditingId(null)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Sistema (no editables) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
            Etiquetas del sistema
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {ABSENCE_TYPES.map((a) => {
            const Icon = ABSENCE_ICONS[a.id]
            return (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-sans flex-1 min-w-0"
                  style={{ backgroundColor: a.color + "22", color: a.color }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{a.name}</span>
                </span>
                <span className="shrink-0">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-muted-foreground text-xs font-sans px-1">
          Estas etiquetas no pueden modificarse ni eliminarse.
        </p>
      </div>

      {/* ── Personalizadas ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Personalizadas</p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setEditingId(null) }}
            className="flex items-center gap-1 text-xs text-primary font-mono hover:opacity-70 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva
          </button>
        </div>

        {/* New label form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="text-foreground text-sm font-medium font-sans">Nueva etiqueta</p>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleAdd() }}
                placeholder="Ej: Guardia, Remoto, Viaje..."
                maxLength={30}
                autoFocus
                className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Color</label>
              <ColorPicker value={newColor} onChange={setNewColor} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              {newName.trim() && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-sans"
                  style={{ backgroundColor: newColor + "22", color: newColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: newColor }} />
                  {newName}
                </span>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm font-medium font-sans"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium font-sans disabled:opacity-30 transition-opacity"
              >
                Crear
              </button>
            </div>
          </div>
        )}

        {/* Custom labels list */}
        {labels.length === 0 && !showForm ? (
          <div className="bg-card border border-border rounded-xl px-6 py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Tag className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-foreground text-sm font-medium">Sin etiquetas personalizadas</p>
            <p className="text-muted-foreground text-xs">
              Crea etiquetas para clasificar tus registros
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {labels.map((label) => (
              <div key={label.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {editingId === label.id ? (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) handleSaveEdit() }}
                      maxLength={30}
                      autoFocus
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 bg-secondary text-foreground rounded-xl text-sm font-medium font-sans"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim()}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium font-sans disabled:opacity-30"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 group">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-sans flex-1 min-w-0"
                      style={{ backgroundColor: label.color + "22", color: label.color }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                      <span className="truncate">{label.name}</span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(label)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                        aria-label="Editar etiqueta"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(label.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-secondary"
                        aria-label="Eliminar etiqueta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
