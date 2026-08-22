import { X, Printer, FileText, CheckCircle2, Ban } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../../lib/utils'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { FlowStatusBadge } from './FlowStatusBadge'
import type { Reservation, RentalBooking } from '../../lib/types'

type Booking = (Reservation & { kind: 'hotel' }) | (RentalBooking & { kind: 'rental' })

interface Props {
  open: boolean
  booking: Booking | null
  onClose: () => void
}

export function FlowBookingModal({ open, booking, onClose }: Props) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose)
  if (!open || !booking) return null

  const isHotel = booking.kind === 'hotel'
  const status = booking.status === 'checked_in'
    ? 'active'
    : booking.status === 'cancelled'
    ? 'cancelled'
    : booking.status === 'pending'
    ? 'pending'
    : booking.status === 'checked_out'
    ? 'completed'
    : 'info'

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-40 animate-flow-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-panel-mid z-50 shadow-panel animate-flow-slide overflow-y-auto flow-scroll"
      >
        <div className="sticky top-0 bg-white dark:bg-panel-mid border-b border-g20/60 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="label-caps text-g40">{isHotel ? 'Reservation' : 'Rental'} · {booking.id}</div>
            <h2 id="booking-modal-title" className="font-display text-xl text-ink dark:text-ivory mt-0.5">
              {isHotel ? booking.guestName : booking.clientName}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close booking detail" className="p-2 rounded-input hover:bg-ivory dark:hover:bg-panel">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <FlowStatusBadge tone={status} dot>
            {booking.status.replace('_', ' ')}
          </FlowStatusBadge>

          <Section title={isHotel ? 'Guest details' : 'Client & licence'}>
            {isHotel ? (
              <Field label="Nationality" value={(booking as Reservation).nationality} />
            ) : (
              <Field label="Driving licence" value="UG-DL 982-44A · expires 2028-09-12" />
            )}
            <Field label="Email" value="guest@example.com" />
            <Field label="Phone" value="+256 700 123 456" />
          </Section>

          {isHotel ? (
            <Section title="Stay details">
              <Field label="Room" value={`${(booking as Reservation).roomNumber} · ${(booking as Reservation).roomType}`} />
              <Field label="Check-in" value={formatDate((booking as Reservation).checkIn)} />
              <Field label="Check-out" value={formatDate((booking as Reservation).checkOut)} />
              <Field label="Nights" value={String((booking as Reservation).nights)} />
              <Field label="Channel" value={(booking as Reservation).channel} />
            </Section>
          ) : (
            <Section title="Rental details">
              <Field label="Vehicle" value={`${(booking as RentalBooking).vehicleLabel} · ${(booking as RentalBooking).vehiclePlate}`} />
              <Field label="Tier" value={(booking as RentalBooking).tier} />
              <Field label="Pick-up" value={(booking as RentalBooking).pickupLocation} />
              <Field label="Return" value={(booking as RentalBooking).returnLocation} />
              <Field label="Duration" value={`${(booking as RentalBooking).days} days`} />
              <Field label="Owner" value={(booking as RentalBooking).owner === 'flow' ? 'Flow Rentals' : `Partner · ${(booking as RentalBooking).partnerName ?? ''}`} />
            </Section>
          )}

          <Section title="Add-ons">
            <div className="grid grid-cols-2 gap-2">
              {(isHotel
                ? ['Breakfast', 'Airport transfer', 'Late checkout', 'Spa credit']
                : ['CDW Insurance', 'GPS', 'Child seat', 'Additional driver']
              ).map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-ink dark:text-ivory">
                  <input type="checkbox" defaultChecked={Math.random() > 0.5} className="accent-teal" />
                  {a}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Payment">
            <Field label="Amount" value={formatCurrency(booking.totalCad)} highlight />
            <Field label="Method" value="Visa ··· 4242" />
            <Field label="Status" value={isHotel ? (booking as Reservation).paymentStatus : 'paid'} />
          </Section>

          <Section title="Notes">
            <textarea
              className="w-full text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input p-2 min-h-[72px] focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-ink dark:text-ivory"
              placeholder="Add a note..."
              defaultValue="Guest requested high floor with city view."
            />
          </Section>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-panel-mid border-t border-g20/60 p-4 flex flex-wrap gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input bg-teal text-white hover:bg-teal-dark text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> Confirm Check-in
          </button>
          <button className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input border border-g20 text-ink dark:text-ivory text-sm">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input border border-g20 text-ink dark:text-ivory text-sm">
            <FileText className="h-4 w-4" /> Invoice
          </button>
          <button className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-input text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm">
            <Ban className="h-4 w-4" /> Cancel
          </button>
        </div>
      </aside>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label-caps text-g40 dark:text-g60 mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-g40 dark:text-g60">{label}</span>
      <span className={cn('text-ink dark:text-ivory font-medium', highlight && 'text-copper font-bold font-display text-base')}>
        {value}
      </span>
    </div>
  )
}

export { type Booking as FlowBooking }
