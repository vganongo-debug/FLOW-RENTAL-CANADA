import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Currency } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CAD-base rates (units of currency per 1 CAD). Le dollar canadien est la
// devise de référence de la plateforme : tous les montants stockés sont en
// CAD et convertis à l'affichage. USD et EUR restent disponibles pour les
// clients internationaux et la consolidation groupe.
// Taux indicatifs mi-marché, à rafraîchir depuis un flux FX en production.
export const FX_RATES: Record<Currency, number> = {
  CAD: 1,
  USD: 0.73,
  EUR: 0.68,
}

export const CURRENCY_LOCALE: Record<Currency, string> = {
  CAD: 'fr-CA',
  USD: 'en-US',
  EUR: 'fr-FR',
}

export function convertFromCad(amountCad: number, currency: Currency) {
  return amountCad * FX_RATES[currency]
}

export function formatCurrency(
  amountCad: number,
  currency: Currency = 'CAD',
  locale = CURRENCY_LOCALE[currency] ?? 'fr-CA',
  opts: { cents?: boolean } = {}
) {
  const value = convertFromCad(amountCad, currency)
  // Les tableaux de bord se lisent mieux sans centimes, mais un devis ou un
  // recu doit afficher le montant exact : arrondir a l'unite partout faisait
  // qu'un total de 835,86 $ s'affichait 836 $, sans correspondre au debit.
  const digits = opts.cents ? 2 : 0
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export function formatDate(d: string | Date, locale = 'fr-CA') {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatPercent(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`
}

export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[]
) {
  if (!rows.length) return
  const headers = Object.keys(rows[0]) as (keyof T)[]
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
