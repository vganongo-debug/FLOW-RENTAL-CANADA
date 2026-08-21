import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FlowWordmark } from '../flow/FlowWordmark'
import { FlowLanguageToggle } from '../flow/FlowLanguageToggle'
import { FlowCurrencySelector } from '../flow/FlowCurrencySelector'
import { FlowCountrySelector } from '../flow/FlowCountrySelector'
import { Globe2, User, Hotel, Car, UserCircle2, Search } from 'lucide-react'
import { cn } from '../../lib/utils'

export function PublicLayout() {
  const { t } = useTranslation()
  const NAV = [
    { to: '/booking/search', label: t('booking.publicNav.stays') },
    { to: '/booking/results', label: t('booking.publicNav.cars') },
    { to: '/booking/account', label: t('booking.publicNav.myAccount') },
  ]
  return (
    <div className="min-h-screen bg-ivory dark:bg-coal text-ink dark:text-ivory">
      <header className="bg-white dark:bg-panel-mid border-b border-g20/60">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="Flow Rentals — home">
            <FlowWordmark size="md" variant="dark" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition',
                    isActive ? 'text-teal' : 'text-ink dark:text-ivory hover:text-teal'
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <FlowLanguageToggle />
            <FlowCountrySelector />
            <FlowCurrencySelector />
            <Link to="/login" className="hidden sm:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-input border border-g20 hover:border-teal text-ink dark:text-ivory">
              <User className="h-3.5 w-3.5" /> {t('common.signIn')}
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom tab nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-panel-mid border-t border-g20/60 shadow-panel">
        <ul className="grid grid-cols-4 h-16">
          {[
            { to: '/booking/search',  label: t('booking.publicNav.stays'),     icon: Hotel },
            { to: '/booking/results', label: t('booking.publicNav.cars'),      icon: Car },
            { to: '/booking/search',  label: t('booking.hero.search'),         icon: Search },
            { to: '/booking/account', label: t('booking.publicNav.myAccount'), icon: UserCircle2 },
          ].map((it, i) => (
            <li key={i}>
              <NavLink
                to={it.to}
                end={it.to === '/booking/search' && i === 0}
                className={({ isActive }) =>
                  cn(
                    'h-full flex flex-col items-center justify-center gap-0.5 text-[10px] label-caps transition',
                    isActive ? 'text-teal' : 'text-g40 hover:text-ink dark:hover:text-ivory'
                  )
                }
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="bg-coal text-ivory mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <FlowWordmark size="md" variant="dark" tagline />
            <p className="text-xs text-g60 mt-4">
              {t('brand.subsidiary')} Operating across Brazzaville, Kampala, and Addis Ababa.
            </p>
          </div>
          <FooterCol title={t('booking.footer.stay')} items={['Brazzaville', 'Kampala', 'Addis Ababa']} />
          <FooterCol title={t('booking.footer.drive')} items={['Airport pickup', 'City rentals', 'Long term', 'Fleet partners']} />
          <FooterCol title={t('booking.footer.company')} items={['Flow Rewards', 'Careers', 'Press', 'Contact']} />
        </div>
        <div className="border-t border-g20/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-g60">
            <span>© 2026 Flow Rentals Global Inc.</span>
            <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> EN · FR</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="label-caps text-copper mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="text-sm text-g80 hover:text-ivory cursor-pointer">{i}</li>
        ))}
      </ul>
    </div>
  )
}
