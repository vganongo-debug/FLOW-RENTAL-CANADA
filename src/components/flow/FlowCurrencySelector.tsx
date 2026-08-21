import { useLocale, useFocusCurrency } from '../../context/LocaleContext'
import { countryByCode } from '../../lib/africa'
import { FX_RATES } from '../../lib/utils'
import type { Currency } from '../../lib/types'

/**
 * Currency dropdown. Always shows the defaults (USD / CAD / EUR), then
 * appends the local currency of the country currently in focus (if any
 * and not already in the defaults). Falls back to a static African list
 * when no country is focused.
 *
 * Driven by `focusCountry` in LocaleContext, which is set automatically
 * when an auth user has a `countryCode`, or manually via
 * <FlowCountrySelector />.
 */

const DEFAULT_CURRENCIES: Currency[] = ['USD', 'CAD', 'EUR']

// Fallback list (when no country is focused) — most common operating currencies
const FALLBACK_AFRICAN: Currency[] = ['XAF', 'XOF', 'UGX', 'ETB', 'KES', 'NGN', 'ZAR']

export function FlowCurrencySelector() {
  const { currency, focusCountry, setCurrency } = useLocale()
  const local = useFocusCurrency()
  const focusedCountry = focusCountry ? countryByCode(focusCountry) : null

  const localOption = local && !DEFAULT_CURRENCIES.includes(local) && local in FX_RATES
    ? (local as Currency)
    : null

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="text-xs font-medium px-2 py-1 rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory focus:outline-none focus:ring-2 focus:ring-teal/30"
      aria-label="Currency"
    >
      <optgroup label="Defaults">
        {DEFAULT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </optgroup>

      {localOption && focusedCountry && (
        <optgroup label={`Local · ${focusedCountry.flag} ${focusedCountry.name}`}>
          <option value={localOption}>{localOption}</option>
        </optgroup>
      )}

      {!localOption && (
        <optgroup label="African operating currencies">
          {FALLBACK_AFRICAN.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
      )}
    </select>
  )
}
