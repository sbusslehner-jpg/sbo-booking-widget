import { ChevronRight } from 'lucide-react'
import { cn } from './util'
import type { Model } from '../types'

type Props = {
  model: Model
  selected: boolean
  onSelect: () => void
}

export function ModelCard({ model, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full flex items-center gap-4 p-3 rounded-md border bg-surface transition-colors bw-focus',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40',
      )}
    >
      {model.image && (
        <img
          src={model.image}
          alt=""
          aria-hidden="true"
          className="w-16 h-12 object-contain shrink-0"
        />
      )}
      <span className="text-text font-medium text-left flex-1">{model.name}</span>
      <ChevronRight className="w-5 h-5 text-text-muted" aria-hidden="true" />
    </button>
  )
}
