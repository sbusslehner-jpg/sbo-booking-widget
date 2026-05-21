import { cn } from './util'

type Props = {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className }: Props) {
  const segments = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Schritt ${current} von ${total}`}
      className={cn('flex gap-2 w-full', className)}
    >
      {segments.map((s) => (
        <div
          key={s}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            s <= current ? 'bg-primary' : 'bg-border',
          )}
        />
      ))}
    </div>
  )
}
