import { cn } from './util'

type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  id?: string
  className?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, id, className, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors bw-focus',
        checked ? 'bg-primary' : 'bg-border',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
