import { useTranslation } from 'react-i18next'
import { useLocale } from '../../context/LocaleContext'
import type { Currency } from '../../lib/types'

/**
 * Sélecteur de devise. CAD est la devise de référence du réseau : tous les
 * montants sont stockés en dollars canadiens. USD et EUR sont proposés à
 * l'affichage pour les clients internationaux et la consolidation groupe.
 */

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'CAD', label: 'CAD · dollar canadien' },
  { code: 'USD', label: 'USD · dollar américain' },
  { code: 'EUR', label: 'EUR · euro' },
]

export function FlowCurrencySelector() {
  const { t } = useTranslation()
  const { currency, setCurrency } = useLocale()

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="text-xs font-medium px-2 py-1 rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory focus:outline-none focus:ring-2 focus:ring-teal/30"
      aria-label={t('nav.currency')}
      title={t('nav.currencyHint')}
    >
      <optgroup label={t('nav.currencyReference')}>
        <option value="CAD">CAD</option>
      </optgroup>
      <optgroup label={t('nav.currencyIntl')}>
        {CURRENCIES.filter((c) => c.code !== 'CAD').map((c) => (
          <option key={c.code} value={c.code}>{c.code}</option>
        ))}
      </optgroup>
    </select>
  )
}
