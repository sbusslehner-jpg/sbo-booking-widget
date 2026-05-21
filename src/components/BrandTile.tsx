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
        'group relative flex items-center justify-center aspect-[4/3] w-full rounded-md border-2 transition-all bw-focus',
        selected
          ? 'bg-primary border-primary text-primary-fg'
          : 'bg-surface border-border text-text-muted hover:border-primary/40 hover:text-text',
      )}
    >
      <div
        className="w-1/2 max-w-[80px] flex items-center justify-center [&_svg]:w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: brand.logo ?? brand.name }}
      />
    </button>
  )
}
