import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'
import { cn } from './util'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  rightSlot?: ReactNode
  leftSlot?: ReactNode
  containerClassName?: string
}

/**
 * Floating-label input. Der Placeholder muss ein einzelnes Leerzeichen sein,
 * damit `:placeholder-shown` zuverlässig reagiert.
 */
export const FormField = forwardRef<HTMLInputElement, Props>(function FormField(
  { label, error, rightSlot, leftSlot, containerClassName, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn('relative', containerClassName)}>
      <div
        className={cn(
          'relative flex items-center rounded-md border bg-surface transition-colors',
          error ? 'border-red-500' : 'border-border focus-within:border-primary',
        )}
      >
        {leftSlot && <div className="pl-3 flex items-center">{leftSlot}</div>}
        <input
          id={inputId}
          ref={ref}
          placeholder=" "
          className={cn(
            'peer w-full bg-transparent px-3 pt-5 pb-2 text-text outline-none',
            className,
          )}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 top-2 text-xs text-text-muted transition-all',
            'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base',
            'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary',
          )}
        >
          {label}
        </label>
        {rightSlot && <div className="pr-3 flex items-center">{rightSlot}</div>}
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  )
})
