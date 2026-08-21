import { useLocale } from '../../context/LocaleContext'
import { AFRICA } from '../../lib/africa'

/**
 * Top-nav country picker. Drives `focusCountry` in LocaleContext, which in
 * turn adds that country's local currency to the FlowCurrencySelector list.
 */
export function FlowCountrySelector() {
  const { focusCountry, setFocusCountry } = useLocale()
  return (
    <select
      value={focusCountry ?? ''}
      onChange={(e) => setFocusCountry(e.target.value || null)}
      className="text-xs font-medium px-2 py-1 rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory focus:outline-none focus:ring-2 focus:ring-teal/30 max-w-[140px]"
      aria-label="Country focus · adds local currency to picker"
      title="Country focus · adds local currency to the currency picker"
    >
      <option value="">🌍 No country focus</option>
      {AFRICA.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name} · {c.primaryCurrency}
        </option>
      ))}
    </select>
  )
}
