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
        'group relative flex items-center justify-center aspect-[4/3] w-full rounded-md border-2 transition-all bw-focus overflow-hidden',
        selected
          ? 'bg-primary border-primary'
          : 'bg-surface border-border hover:border-primary/40',
      )}
    >
      {brand.logo ? (
        <img
          src={brand.logo}
          alt=""
          aria-hidden="true"
          className={cn(
            'max-w-[70%] max-h-[60%] object-contain transition-all',
            selected && 'invert brightness-200',
          )}
        />
      ) : (
        <span
          className={cn(
            'text-sm font-semibold',
            selected ? 'text-primary-fg' : 'text-text',
          )}
        >
          {brand.name}
        </span>
      )}
    </button>
  )
}
