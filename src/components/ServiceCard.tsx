import * as icons from 'lucide-react'
import { cn, formatEUR } from './util'
import type { Service } from '../types'

type Props = {
  service: Service
  selected: boolean
  onToggle: () => void
}

export function ServiceCard({ service, selected, onToggle }: Props) {
  const IconComp =
    (service.icon && (icons as unknown as Record<string, icons.LucideIcon>)[service.icon]) ||
    icons.Wrench
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'group flex flex-col items-start gap-3 p-4 rounded-md border bg-surface text-left transition-all h-full bw-focus',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-surface-muted',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors',
          selected ? 'bg-primary text-primary-fg' : 'bg-surface-muted text-text',
        )}
      >
        <IconComp className="w-4 h-4" aria-hidden="true" />
      </span>
      <div className="flex-1 space-y-1">
        <div className="font-semibold text-text leading-tight">{service.name}</div>
        <div className="text-sm text-text-muted leading-snug">{service.description}</div>
      </div>
      {service.price !== null && service.price > 0 && (
        <div className="text-sm font-semibold text-text mt-auto pt-1">
          {formatEUR(service.price)}
        </div>
      )}
    </button>
  )
}
