// Paleta ampliada de colores para etiquetas
export const PRESET_COLORS = [
  "#ef4444", // rojo
  "#f97316", // naranja
  "#f59e0b", // ámbar
  "#eab308", // amarillo
  "#84cc16", // lima
  "#22c55e", // verde
  "#10b981", // esmeralda
  "#14b8a6", // teal
  "#06b6d4", // cian
  "#0ea5e9", // celeste
  "#3b82f6", // azul
  "#6366f1", // índigo
  "#8b5cf6", // violeta
  "#a855f7", // púrpura
  "#d946ef", // fucsia
  "#ec4899", // rosa
  "#f43f5e", // rosa fuerte
  "#78716c", // piedra
  "#64748b", // pizarra
  "#a3a3a3", // gris
]

// Colores fijos para los tipos de día especiales (0 horas).
// Cada tipo tiene un color ÚNICO que no puede reutilizarse en etiquetas personalizadas.
export const FRANCO_COLOR = "#0ea5e9" // celeste
export const JUSTIFIED_COLOR = "#22c55e" // verde
export const UNJUSTIFIED_COLOR = "#ef4444" // rojo
export const SUSPENSION_COLOR = "#f59e0b" // ámbar

// Colores reservados por los tipos de día especiales
export const RESERVED_COLORS = [FRANCO_COLOR, JUSTIFIED_COLOR, UNJUSTIFIED_COLOR, SUSPENSION_COLOR]

// Colores disponibles para etiquetas personalizadas (excluye los reservados)
export const LABEL_COLORS = PRESET_COLORS.filter((c) => !RESERVED_COLORS.includes(c))
