import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function InlineWrapper({ children }: Props) {
  return (
    <div className="w-full max-w-widget mx-auto bg-surface border border-border rounded-lg shadow-card overflow-hidden flex flex-col min-h-[640px]">
      {children}
    </div>
  )
}
