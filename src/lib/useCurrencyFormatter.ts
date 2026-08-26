import { useCallback } from 'react'
import { useLocale } from '../context/LocaleContext'
import { formatCurrency } from './utils'
import type { Currency } from './types'

/**
 * Hook that returns a `format` function pre-bound to the active currency
 * from LocaleContext. Pass an override currency as the second arg if needed.
 *
 *   const format = useCurrencyFormatter()
 *   format(195) // → "195 $" en CAD, "142 $ US" quand le sélecteur est sur USD
 */
export function useCurrencyFormatter() {
  const { currency, language } = useLocale()
  // Locales canadiennes : en fr-FR, CAD s'affiche « 130 $CA » au lieu de « 130 $ ».
  const locale = language === 'FR' ? 'fr-CA' : 'en-CA'
  return useCallback(
    (amountCad: number, overrideCurrency?: Currency, opts?: { cents?: boolean }) =>
      formatCurrency(amountCad, overrideCurrency ?? currency, locale, opts),
    [currency, locale]
  )
}
