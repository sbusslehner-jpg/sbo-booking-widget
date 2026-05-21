import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from './util'

type CountryCode = {
  code: string
  flag: string
  label: string
}

const COUNTRIES: CountryCode[] = [
  { code: '+43', flag: '🇦🇹', label: 'Österreich' },
  { code: '+49', flag: '🇩🇪', label: 'Deutschland' },
  { code: '+41', flag: '🇨🇭', label: 'Schweiz' },
  { code: '+39', flag: '🇮🇹', label: 'Italien' },
]

type Props = {
  country: string
  number: string
  onCountryChange: (next: string) => void
  onNumberChange: (next: string) => void
  label: string
  error?: string
  containerClassName?: string
}

export function PhoneInput({
  country,
  number,
  onCountryChange,
  onNumberChange,
  label,
  error,
  containerClassName,
}: Props) {
  const { t } = useTranslation()
  const selected = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0]
  return (
    <div className={cn('relative', containerClassName)}>
      <div
        className={cn(
          'relative flex items-stretch rounded-md border bg-surface transition-colors overflow-hidden',
          error ? 'border-red-500' : 'border-border focus-within:border-primary',
        )}
      >
        <label className="flex items-center gap-1.5 pl-3 pr-2 border-r border-border bg-surface-muted">
          <span aria-hidden="true" className="text-sm">{selected.flag}</span>
          <select
            aria-label={t('common.countryCodeAria')}
            value={country}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onCountryChange(e.target.value)}
            className="bg-transparent py-2 pr-2 text-sm outline-none cursor-pointer bw-focus"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </label>
        <div className="relative flex-1">
          <input
            id="phone"
            type="tel"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
            placeholder=" "
            className="peer w-full bg-transparent px-3 pt-4 pb-1.5 text-sm text-text outline-none"
          />
          <label
            htmlFor="phone"
            className={cn(
              'pointer-events-none absolute left-3 top-1.5 text-[11px] text-text-muted transition-all',
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm',
              'peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary',
            )}
          >
            {label}
          </label>
        </div>
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
