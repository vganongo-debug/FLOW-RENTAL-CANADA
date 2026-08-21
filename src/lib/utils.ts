import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Currency } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// USD-base rates (units of currency per 1 USD). Includes USD + the
// always-available CAD/EUR defaults, plus all African local currencies.
// All rates are approximate mid-market values for demo purposes.
export const FX_RATES: Record<Currency, number> = {
  // Defaults
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,

  // CFA blocs (pegged to EUR)
  XAF: 600,    // Central African CFA franc
  XOF: 600,    // West African CFA franc

  // East Africa
  UGX: 3700,
  ETB: 56,
  KES: 130,
  RWF: 1350,
  TZS: 2500,
  BIF: 2850,
  DJF: 178,

  // West Africa (non-CFA)
  NGN: 1500,
  GHS: 12,
  GMD: 68,
  GNF: 8600,
  SLE: 22,
  LRD: 195,

  // Southern Africa
  ZAR: 18,
  BWP: 13.5,
  NAD: 18,
  ZMW: 26,
  MWK: 1700,
  MZN: 64,
  SZL: 18,
  LSL: 18,
  ZWL: 32_000,

  // North Africa
  MAD: 10,
  EGP: 48,
  TND: 3.1,
  DZD: 135,
  LYD: 4.85,
  SDG: 600,

  // Central + island states
  CDF: 2800,
  AOA: 905,
  STN: 23,
  MGA: 4500,
  MUR: 46,
  SCR: 13.5,
  KMF: 460,
  CVE: 102,
  ERN: 15,
  SOS: 570,
  SSP: 750,

  // Mauritania
  MRU: 40,
}

export function convertFromUsd(amountUsd: number, currency: Currency) {
  return amountUsd * FX_RATES[currency]
}

export function formatCurrency(
  amountUsd: number,
  currency: Currency = 'USD',
  locale = 'en-US'
) {
  const value = convertFromUsd(amountUsd, currency)
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

export function formatDate(d: string | Date, locale = 'en-GB') {
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
