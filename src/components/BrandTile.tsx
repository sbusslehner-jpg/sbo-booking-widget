import { cn } from './util'
import type { Brand } from '../types'

type Props = {
  brand: Brand
  selected: boolean
  onSelect: () => void
}

export function BrandTile({ brand, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={brand.name}
      className={cn(
        'group flex flex-col items-center justify-center aspect-[3/2] w-full rounded-md border transition-all bw-focus',
        selected
          ? 'bg-primary border-primary text-primary-fg shadow-card'
          : 'bg-surface border-border text-text hover:border-primary/40',
      )}
    >
      <div
        className={cn(
          'w-3/4 flex items-center justify-center',
          selected ? 'text-primary-fg' : 'text-text',
        )}
        dangerouslySetInnerHTML={{ __html: brand.logo ?? brand.name }}
      />
    </button>
  )
}
