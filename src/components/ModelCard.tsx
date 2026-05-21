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
        'group w-full flex items-center gap-4 px-4 py-3 rounded-md border bg-surface transition-all bw-focus',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-surface-muted',
      )}
    >
      {model.image && (
        <div className="w-14 h-10 shrink-0 flex items-center justify-center">
          <img src={model.image} alt="" aria-hidden="true" className="max-w-full max-h-full object-contain" />
        </div>
      )}
      <span className="text-text font-medium text-left flex-1">{model.name}</span>
      <ChevronRight
        className={cn(
          'w-4 h-4 shrink-0 transition-colors',
          selected ? 'text-primary' : 'text-text-muted/60',
        )}
        aria-hidden="true"
      />
    </button>
  )
}
