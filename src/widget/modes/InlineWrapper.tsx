import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/**
 * Fixe Höhe (720px Desktop, 640px Mobile via media query) sorgt dafür,
 * dass der innere Scroll-Bereich + die Sticky-Footer / Cart immer
 * sichtbar bleiben. Vorher: min-h-Konstrukt, das bei langen Inhalten
 * (Step 3) den Footer aus dem Viewport schob.
 */
export function InlineWrapper({ children }: Props) {
  return (
    <div className="w-full max-w-widget mx-auto bg-surface border border-border rounded-lg shadow-card overflow-hidden flex flex-col h-[640px] sm:h-[720px]">
      {children}
    </div>
  )
}
