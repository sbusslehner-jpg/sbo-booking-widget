import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from './util'

type Option = { value: string; label: string }

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label: string
  options: Option[]
  error?: string
  containerClassName?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, options, error, containerClassName, className, id, placeholder, value, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hasValue = !!value
  return (
    <div className={cn('relative', containerClassName)}>
      <div
        className={cn(
          'relative flex items-center rounded-md border bg-surface transition-colors',
          error ? 'border-red-500' : 'border-border focus-within:border-primary',
        )}
      >
        <select
          id={inputId}
          ref={ref}
          value={value}
          className={cn(
            'peer w-full bg-transparent px-3 pt-5 pb-2 pr-9 text-text outline-none appearance-none cursor-pointer',
            className,
          )}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 transition-all',
            hasValue ? 'top-2 text-xs text-text-muted' : 'top-1/2 -translate-y-1/2 text-text-muted',
          )}
        >
          {label}
        </label>
        <ChevronDown
          className="absolute right-3 w-4 h-4 text-text-muted pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  )
})
