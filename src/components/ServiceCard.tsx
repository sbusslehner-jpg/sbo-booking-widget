import * as icons from 'lucide-react'
import { cn, formatEUR } from './util'
import type { Service } from '../types'

type Props = {
  service: Service
  selected: boolean
  onToggle: () => void
}

export function ServiceCard({ service, selected, onToggle }: Props) {
  const IconComp = (service.icon && (icons as unknown as Record<string, icons.LucideIcon>)[service.icon]) || icons.Wrench
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-start gap-3 p-4 rounded-md border bg-surface text-left transition-colors h-full bw-focus',
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/40',
      )}
    >
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-muted text-text">
        <IconComp className="w-5 h-5" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <div className="font-semibold text-text">{service.name}</div>
        <div className="text-sm text-text-muted">{service.description}</div>
      </div>
      {service.price !== null && service.price > 0 && (
        <div className="mt-auto text-text font-medium">{formatEUR(service.price)}</div>
      )}
    </button>
  )
}
