import { useTranslation } from 'react-i18next'
import { useLocale } from '../../context/LocaleContext'
import { PROVINCES } from '../../lib/canada'

/**
 * Sélecteur de province / territoire de la barre supérieure. Pilote
 * `focusCountry` dans LocaleContext, qui détermine le régime de taxes de
 * vente appliqué par défaut dans les écrans comptables.
 */
export function FlowCountrySelector() {
  const { t, i18n } = useTranslation()
  const isFr = i18n.language === 'fr'
  const { focusCountry, setFocusCountry } = useLocale()
  return (
    <select
      value={focusCountry ?? ''}
      onChange={(e) => setFocusCountry(e.target.value || null)}
      className="text-xs font-medium px-2 py-1 rounded-input bg-ivory dark:bg-panel border border-g20/60 text-ink dark:text-ivory focus:outline-none focus:ring-2 focus:ring-teal/30 max-w-[160px]"
      aria-label={t('nav.provinceFocus')}
      title={t('nav.provinceFocus')}
    >
      <option value="">🇨🇦 {t('nav.allProvinces')}</option>
      {PROVINCES.map((p) => (
        <option key={p.code} value={p.code}>
          {p.code} · {isFr ? p.name : p.nameEn} · {isFr ? p.taxName : p.taxNameEn}
        </option>
      ))}
    </select>
  )
}
