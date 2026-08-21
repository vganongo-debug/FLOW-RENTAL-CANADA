import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import i18n from '../i18n'
import { useAuth } from './AuthContext'
import { AFRICA, countryByCode } from '../lib/africa'
import type { Currency, Language } from '../lib/types'

interface LocaleCtx {
  language: Language
  currency: Currency
  /** ISO-2 of the country whose local currency should be surfaced. */
  focusCountry: string | null
  setLanguage: (l: Language) => void
  setCurrency: (c: Currency) => void
  setFocusCountry: (code: string | null) => void
}

const LocaleContext = createContext<LocaleCtx | null>(null)
const KEY_LANG = 'flow-os.lang'
const KEY_CCY = 'flow-os.ccy'
const KEY_FOCUS = 'flow-os.focus-country'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    (typeof window !== 'undefined' && (window.localStorage.getItem(KEY_LANG) as Language)) || 'EN'
  )
  const [currency, setCurrency] = useState<Currency>(() =>
    (typeof window !== 'undefined' && (window.localStorage.getItem(KEY_CCY) as Currency)) || 'USD'
  )
  const [focusCountry, setFocusCountry] = useState<string | null>(() =>
    (typeof window !== 'undefined' && window.localStorage.getItem(KEY_FOCUS)) || null
  )

  useEffect(() => {
    window.localStorage.setItem(KEY_LANG, language)
    i18n.changeLanguage(language === 'FR' ? 'fr' : 'en')
    document.documentElement.lang = language === 'FR' ? 'fr' : 'en'
  }, [language])
  useEffect(() => { window.localStorage.setItem(KEY_CCY, currency) }, [currency])
  useEffect(() => {
    if (focusCountry) window.localStorage.setItem(KEY_FOCUS, focusCountry)
    else window.localStorage.removeItem(KEY_FOCUS)
  }, [focusCountry])

  const value = useMemo(
    () => ({ language, currency, focusCountry, setLanguage, setCurrency, setFocusCountry }),
    [language, currency, focusCountry]
  )

  return (
    <LocaleContext.Provider value={value}>
      <AutoFocusCountry />
      {children}
    </LocaleContext.Provider>
  )
}

/**
 * Side-effect-only component: when the logged-in user has a countryCode
 * AND no focusCountry choice has ever been made, default the focus to
 * that country once. After the first run, the user's manual choice
 * (including "No country focus") wins forever.
 */
function AutoFocusCountry() {
  const auth = useAuth()
  const { focusCountry, setFocusCountry } = useLocaleInternal()
  const ranRef = useRef(false)
  useEffect(() => {
    if (ranRef.current) return
    // Wait for auth to resolve (user is null while loading)
    if (auth.loading) return
    // Storage already holds a prior choice — respect it
    if (typeof window !== 'undefined' && window.localStorage.getItem('flow-os.focus-country.initialised') === '1') {
      ranRef.current = true
      return
    }
    if (!focusCountry) {
      const code = auth.user?.countryCode
      if (code && countryByCode(code)) setFocusCountry(code)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('flow-os.focus-country.initialised', '1')
    }
    ranRef.current = true
  }, [auth.loading, auth.user, focusCountry, setFocusCountry])
  return null
}

function useLocaleInternal() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('LocaleContext missing')
  return ctx
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}

/**
 * Returns the currency code currently linked to the focused country, or
 * null when no country is focused. Used by FlowCurrencySelector.
 */
export function useFocusCurrency(): Currency | null {
  const { focusCountry } = useLocale()
  if (!focusCountry) return null
  const c = AFRICA.find((x) => x.code === focusCountry)
  return (c?.primaryCurrency as Currency) ?? null
}
