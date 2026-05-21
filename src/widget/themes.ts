/**
 * Theme-System für das Booking-Widget.
 *
 * Jedes Theme ist eine Map von CSS-Variablen, die auf dem Shadow-Root-Host
 * gesetzt werden. Konsumenten wählen per Name (z.B. `theme="vw"`) oder
 * übergeben ein eigenes Objekt für komplett custom Branding.
 */

export type ThemeTokens = {
  /** Primärfarbe für CTAs, selected-States, Progress-Bar. */
  '--color-primary': string
  /** Textfarbe auf Primärfarbe (meist weiß). */
  '--color-primary-fg': string
  '--color-surface': string
  '--color-surface-muted': string
  '--color-border': string
  '--color-text': string
  '--color-text-muted': string
  /** Akzent-Blau für Links, "Empfehlung erhalten"-Highlights etc. */
  '--color-accent-blue': string
  '--color-success': string
  '--color-info-bg': string
  '--radius-sm': string
  '--radius-md': string
  '--radius-lg': string
  '--font-sans': string
}

export type ThemeName = 'neutral' | 'vw'

export type ThemeInput = ThemeName | Partial<ThemeTokens>

const baseTokens: ThemeTokens = {
  '--color-primary': '#1a2332',
  '--color-primary-fg': '#ffffff',
  '--color-surface': '#ffffff',
  '--color-surface-muted': '#f7f8fa',
  '--color-border': '#e5e7eb',
  '--color-text': '#0f172a',
  '--color-text-muted': '#6b7280',
  '--color-accent-blue': '#2563eb',
  '--color-success': '#10b981',
  '--color-info-bg': '#eff6ff',
  '--radius-sm': '8px',
  '--radius-md': '12px',
  '--radius-lg': '16px',
  '--font-sans': "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
}

/**
 * Registry der vordefinierten Themes. Jeder Eintrag überschreibt nur die
 * relevanten Tokens, der Rest fällt auf `baseTokens` zurück.
 */
const themeRegistry: Record<ThemeName, Partial<ThemeTokens>> = {
  neutral: {},
  vw: {
    // Volkswagen Wolfsburg-Blau (Markenrichtlinien-naher Wert)
    '--color-primary': '#001e50',
    '--color-primary-fg': '#ffffff',
    '--color-accent-blue': '#00b0f0',
    '--color-info-bg': '#e3f2fd',
    '--radius-sm': '4px',
    '--radius-md': '8px',
    '--radius-lg': '12px',
  },
}

/**
 * Löst den `theme`-Prop in einen vollständigen CSS-Variablen-Satz auf.
 * - String → Lookup im Registry
 * - Objekt → Merge auf Basis-Tokens
 * - undefined → neutral
 */
export function resolveTheme(input: ThemeInput | undefined): ThemeTokens {
  if (!input) return { ...baseTokens }
  if (typeof input === 'string') {
    const preset = themeRegistry[input] ?? {}
    return { ...baseTokens, ...preset }
  }
  return { ...baseTokens, ...input }
}

/**
 * Schreibt die aufgelösten Tokens als inline-style auf das übergebene Element.
 * Wir nutzen `setProperty`, weil `--vars` von der TS-Style-API nicht direkt
 * akzeptiert werden.
 */
export function applyThemeToElement(el: HTMLElement, tokens: ThemeTokens): void {
  for (const [key, value] of Object.entries(tokens)) {
    el.style.setProperty(key, value)
  }
}

export const availableThemes: ReadonlyArray<ThemeName> = ['neutral', 'vw']
