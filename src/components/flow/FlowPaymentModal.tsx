import { useState } from 'react'
import { CreditCard, Smartphone, Banknote, X, ShieldCheck } from 'lucide-react'
import { cn, formatCurrency, FX_RATES } from '../../lib/utils'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { FlowStripeCard } from './FlowStripeCard'
import type { Currency } from '../../lib/types'

type Method = 'card' | 'interac' | 'applepay' | 'googlepay' | 'transfer' | 'cash'

const METHODS: { id: Method; label: string; icon: React.ComponentType<{ className?: string }>; sub: string }[] = [
  { id: 'card',   label: 'Visa / Mastercard',  icon: CreditCard, sub: 'Stripe processing' },
  { id: 'interac', label: 'Interac',   icon: Smartphone, sub: 'Toutes les banques canadiennes' },
  { id: 'applepay', label: 'Apple Pay',  icon: Smartphone, sub: 'iPhone · Apple Watch' },
  { id: 'googlepay', label: 'Google Pay', icon: Smartphone, sub: 'Android · navigateur' },
  { id: 'transfer', label: 'Virement bancaire', icon: CreditCard, sub: 'Desjardins · RBC · BMO' },
  { id: 'cash',   label: 'Cash · front desk',  icon: Banknote,   sub: 'On site' },
]

interface Props {
  open: boolean
  amount: number
  currency?: Currency
  onClose: () => void
  onConfirm?: (method: Method, ref: string) => void
}

export function FlowPaymentModal({ open, amount, currency = 'USD', onClose, onConfirm }: Props) {
  const [method, setMethod] = useState<Method>('card')
  const [ref, setRef] = useState('')
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose)

  if (!open) return null

  const localEquiv = amount * FX_RATES[currency]

  return (
    <>
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 animate-flow-fade" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          className="bg-white dark:bg-panel-mid w-full max-w-md rounded-card shadow-panel animate-flow-fade overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-g20/60">
            <h2 id="payment-modal-title" className="font-display text-lg text-ink dark:text-ivory">Process payment</h2>
            <button onClick={onClose} aria-label="Close payment dialog" className="p-1 rounded-input hover:bg-ivory dark:hover:bg-panel">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="font-display font-bold text-4xl text-copper">
                {formatCurrency(amount, currency)}
              </div>
              {currency !== 'USD' && (
                <div className="text-xs text-g40 mt-1">
                  ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(localEquiv)}
                </div>
              )}
            </div>

            <div>
              <label className="label-caps text-g40 mb-2 block">Method</label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-input border text-left text-sm transition',
                      method === m.id
                        ? 'border-teal bg-teal-light dark:bg-teal-dark/30 text-ink dark:text-ivory'
                        : 'border-g20/60 text-ink dark:text-ivory hover:border-teal/50'
                    )}
                  >
                    <m.icon className="h-4 w-4 text-teal shrink-0" />
                    <div>
                      <div className="font-medium leading-tight">{m.label}</div>
                      <div className="text-[10px] text-g40 leading-tight">{m.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-caps text-g40 mb-1 block">Reference</label>
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Booking ID or note…"
                maxLength={64}
                className="w-full px-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory focus:outline-none focus:ring-2 focus:ring-teal/30"
              />
            </div>

            {method === 'card' && (
              <FlowStripeCard
                amountCad={amount}
                onPaymentMethod={(pmId) => onConfirm?.(method, `${ref || ''}${ref ? ' · ' : ''}stripe:${pmId}`)}
              />
            )}

            <div className="text-xs text-g40 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal" />
              {method === 'card'
                ? 'Card data isolated in Stripe iframe · SAQ-A scope'
                : 'Transaction logged to Flow Pay ledger'}
            </div>
          </div>

          <div className="px-5 py-3 border-t border-g20/60 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-input border border-g20 text-sm">Cancel</button>
            {method !== 'card' && (
              <button
                onClick={() => onConfirm?.(method, ref)}
                className="px-4 py-2 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
              >
                Confirm payment
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
