import { useId } from 'react'
import { cn } from './util'

type Props = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (next: number) => void
  label?: string
  formatValue?: (v: number) => string
  className?: string
  dark?: boolean
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  formatValue,
  className,
  dark,
}: Props) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={id}
            className={cn('text-sm', dark ? 'text-white/80' : 'text-text-muted')}
          >
            {label}
          </label>
          <span className={cn('text-sm font-medium', dark ? 'text-white' : 'text-text')}>
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full appearance-none bg-transparent cursor-pointer bw-focus',
          'bw-slider',
        )}
        style={{
          // We render the track with a gradient that follows the value.
          background: `linear-gradient(to right, ${
            dark ? 'rgba(255,255,255,0.85)' : 'var(--color-primary)'
          } 0%, ${
            dark ? 'rgba(255,255,255,0.85)' : 'var(--color-primary)'
          } ${pct}%, ${dark ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'} ${pct}%, ${
            dark ? 'rgba(255,255,255,0.2)' : 'var(--color-border)'
          } 100%)`,
          borderRadius: '9999px',
          height: '4px',
        }}
      />
      <style>{`
        .bw-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: ${dark ? '#ffffff' : 'var(--color-primary)'};
          border: 2px solid ${dark ? 'var(--color-primary)' : '#ffffff'};
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .bw-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: ${dark ? '#ffffff' : 'var(--color-primary)'};
          border: 2px solid ${dark ? 'var(--color-primary)' : '#ffffff'};
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
