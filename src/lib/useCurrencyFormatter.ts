import { useCallback } from 'react'
import { useLocale } from '../context/LocaleContext'
import { formatCurrency } from './utils'
import type { Currency } from './types'

/**
 * Hook that returns a `format` function pre-bound to the active currency
 * from LocaleContext. Pass an override currency as the second arg if needed.
 *
 *   const format = useCurrencyFormatter()
 *   format(195) // → "XAF 117,000" when selector is on XAF
 */
export function useCurrencyFormatter() {
  const { currency, language } = useLocale()
  const locale = language === 'FR' ? 'fr-FR' : 'en-US'
  return useCallback(
    (amountUsd: number, overrideCurrency?: Currency) =>
      formatCurrency(amountUsd, overrideCurrency ?? currency, locale),
    [currency, locale]
  )
}
