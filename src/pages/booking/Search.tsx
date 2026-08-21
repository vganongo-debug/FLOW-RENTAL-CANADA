import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Hotel, Car, Search as SearchIcon, MapPin, Calendar, Users, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { FlowWordmark } from '../../components/flow/FlowWordmark'
import { cn } from '../../lib/utils'

type Mode = 'stay' | 'drive'

export default function Search() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('stay')

  return (
    <div className="-mt-1">
      <section className="relative overflow-hidden bg-coal text-ivory">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(184,115,51,0.5),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(11,110,110,0.6),transparent_55%)]" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
          <FlowWordmark size="xl" variant="dark" tagline className="mx-auto" />
          <p className="mt-6 text-lg text-g80 max-w-xl mx-auto">
            {t('booking.hero.lead')} {t('booking.hero.copy')}
          </p>

          <div className="mt-10 bg-white dark:bg-panel-mid text-ink dark:text-ivory rounded-card shadow-panel max-w-3xl mx-auto p-2 text-left">
            <div className="flex p-1">
              <Tab active={mode === 'stay'} onClick={() => setMode('stay')} icon={<Hotel className="h-4 w-4" />} label={t('booking.hero.stay')} />
              <Tab active={mode === 'drive'} onClick={() => setMode('drive')} icon={<Car className="h-4 w-4" />} label={t('booking.hero.drive')} />
            </div>
            {mode === 'stay' ? <StayForm /> : <DriveForm />}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center font-display text-3xl text-ink dark:text-ivory mb-2">{t('booking.why.title')}</h2>
        <p className="text-center text-g40 mb-10">{t('booking.why.subtitle')}</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Value number="01" title={t('booking.why.a')} body={t('booking.why.aBody')} icon={<Sparkles className="h-5 w-5" />} />
          <Value number="02" title={t('booking.why.b')} body={t('booking.why.bBody')} icon={<ShieldCheck className="h-5 w-5" />} />
          <Value number="03" title={t('booking.why.c')} body={t('booking.why.cBody')} icon={<Zap className="h-5 w-5" />} />
        </div>
      </section>

      <section className="bg-ivory dark:bg-panel py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-ink dark:text-ivory">{t('booking.markets.title')}</h2>
          <p className="text-g40 dark:text-g60 mt-1">{t('booking.markets.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              { city: 'Brazzaville', country: 'Congo-Brazzaville', adr: '$130 / night', stat: 'Flagship · 30 rooms' },
              { city: 'Kampala', country: 'Uganda', adr: '$110 / night', stat: 'Mercantile partner fleet' },
              { city: 'Addis Ababa', country: 'Ethiopia', adr: '$105 / night', stat: 'Bole airport vehicles' },
            ].map((m) => (
              <div key={m.city} className="rounded-card overflow-hidden bg-white dark:bg-panel-mid border border-g20/60 shadow-card">
                <div className="aspect-[4/3] bg-gradient-to-br from-teal to-teal-dark relative">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(184,115,51,0.6),transparent_60%)]" />
                  <div className="absolute bottom-3 left-4 text-ivory">
                    <div className="font-display text-2xl">{m.city}</div>
                    <div className="text-xs opacity-80 flex items-center gap-1"><MapPin className="h-3 w-3" /> {m.country}</div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between text-sm">
                  <span className="text-g40">{m.stat}</span>
                  <span className="text-copper font-display font-bold">{m.adr}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-medium transition',
        active ? 'bg-teal text-white' : 'text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-panel'
      )}
    >
      {icon} {label}
    </button>
  )
}

function StayForm() {
  const { t } = useTranslation()
  return (
    <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 p-2">
      <Field icon={<MapPin className="h-4 w-4" />} label={t('booking.hero.destination')} defaultValue="Kampala, Uganda" />
      <Field icon={<Calendar className="h-4 w-4" />} label={t('booking.hero.checkIn')} defaultValue="14 May 2026" />
      <Field icon={<Calendar className="h-4 w-4" />} label={t('booking.hero.checkOut')} defaultValue="18 May 2026" />
      <Field icon={<Users className="h-4 w-4" />} label={t('booking.hero.guests')} defaultValue="2 adults" />
      <Link
        to="/booking/results"
        className="inline-flex items-center justify-center gap-1 px-5 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
      >
        <SearchIcon className="h-4 w-4" /> {t('booking.hero.search')}
      </Link>
    </div>
  )
}

function DriveForm() {
  const { t } = useTranslation()
  return (
    <div className="grid md:grid-cols-[2fr_2fr_1.2fr_auto] gap-2 p-2">
      <Field icon={<MapPin className="h-4 w-4" />} label={t('booking.hero.pickUp')} defaultValue="Entebbe Intl Airport" />
      <Field icon={<MapPin className="h-4 w-4" />} label={t('booking.hero.return')} defaultValue="Same as pick-up" />
      <Field icon={<Calendar className="h-4 w-4" />} label={t('booking.hero.dates')} defaultValue="14 – 18 May" />
      <Link
        to="/booking/results"
        className="inline-flex items-center justify-center gap-1 px-5 rounded-input bg-copper text-white hover:bg-copper-dark text-sm font-medium"
      >
        <SearchIcon className="h-4 w-4" /> {t('booking.hero.search')}
      </Link>
    </div>
  )
}

function Field({ icon, label, defaultValue }: { icon: React.ReactNode; label: string; defaultValue: string }) {
  return (
    <label className="flex items-center gap-2 px-3 py-2 rounded-input border border-g20/60 bg-ivory dark:bg-panel">
      <span className="text-teal">{icon}</span>
      <span className="flex-1">
        <span className="block label-caps text-g40">{label}</span>
        <input
          defaultValue={defaultValue}
          className="bg-transparent w-full text-sm text-ink dark:text-ivory focus:outline-none"
        />
      </span>
    </label>
  )
}

function Value({ number, title, body, icon }: { number: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-card p-6 bg-white dark:bg-panel-mid border border-g20/60 shadow-card">
      <div className="flex items-start justify-between mb-3">
        <span className="h-10 w-10 rounded-card bg-teal-light text-teal flex items-center justify-center">{icon}</span>
        <span className="font-display font-bold text-2xl text-copper">{number}</span>
      </div>
      <h3 className="font-display text-lg text-ink dark:text-ivory">{title}</h3>
      <p className="text-sm text-g40 dark:text-g60 mt-1">{body}</p>
    </div>
  )
}
