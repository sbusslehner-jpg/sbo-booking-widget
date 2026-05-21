import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from './util'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors bw-focus',
        variant === 'primary' &&
          'bg-primary text-primary-fg hover:bg-primary/90 disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed',
        variant === 'secondary' &&
          'bg-surface text-text border border-border hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'ghost' &&
          'bg-transparent text-text hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
