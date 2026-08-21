import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { FlowWordmark } from '../components/flow/FlowWordmark'
import { FlowLanguageToggle } from '../components/flow/FlowLanguageToggle'
import { useAuth } from '../context/AuthContext'
import { ROLE_HOMES } from '../lib/sampleData'
import type { Role } from '../lib/types'
import { cn } from '../lib/utils'

const ROLE_OPTIONS: Role[] = ['superadmin', 'country_manager', 'hotel_manager', 'car_agent', 'fleet_partner', 'reward_manager', 'guest']

export default function Login() {
  const { t } = useTranslation()
  const { loginAs } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('superadmin')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [email, setEmail] = useState('vistel@flowrentals.com')

  const [submitting, setSubmitting] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await loginAs(role)
    setSubmitting(false)
    navigate(ROLE_HOMES[role], { replace: true })
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-coal text-ivory overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(184,115,51,0.5),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(11,110,110,0.6),transparent_55%)]" />
        <div className="relative">
          <FlowWordmark size="lg" variant="dark" tagline />
        </div>
        <div className="relative space-y-4">
          <p className="font-display text-3xl leading-snug">{t('login.pitch')}</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Stat value="3" label={t('login.marketsLive')} />
            <Stat value="90" label={t('login.rooms')} />
            <Stat value="40+" label={t('login.vehicles')} />
          </div>
          <div className="text-xs text-g60 mt-8">{t('brand.subsidiary')} · Operating across Africa</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <div className="lg:hidden">
              <FlowWordmark size="md" />
            </div>
            <div className="lg:ml-auto">
              <FlowLanguageToggle />
            </div>
          </div>
          <h1 className="font-display text-3xl text-ink mb-1">{t('login.title')}</h1>
          <p className="text-sm text-g40 mb-8">{t('login.subtitle')}</p>

          <label className="label-caps text-g40 block mb-2">{t('common.selectRole')}</label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLE_OPTIONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  'text-left px-3 py-2.5 rounded-input border transition',
                  role === r
                    ? 'border-teal bg-teal-light text-ink'
                    : 'border-g20/60 hover:border-teal/50'
                )}
              >
                <div className="font-medium text-sm">{t(`roles.${r}`)}</div>
                <div className="text-[10px] text-g40 mt-0.5">{t(`roles.${r}_sub`)}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="label-caps text-g40 mb-1 block">{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-g20/60 rounded-input focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-ink"
              />
            </div>
            <div>
              <label className="label-caps text-g40 mb-1 block">{t('common.password')}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  defaultValue="demo-flow-2026"
                  className="w-full px-3 py-2 pr-10 bg-white border border-g20/60 rounded-input focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-ink"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-g40 hover:text-ink"
                  aria-label="Toggle password"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-g40">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-teal"
                />
                {t('common.rememberMe')}
              </label>
              <a className="text-teal hover:text-teal-dark" href="#">{t('common.forgotPassword')}</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-input bg-teal text-white hover:bg-teal-dark font-medium disabled:opacity-60"
          >
            {submitting ? '…' : t('login.continueAs', { role: t(`roles.${role}`) })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mt-6 text-xs text-g40 text-center">
            {t('login.browsingGuest')}{' '}
            <Link to="/booking/search" className="text-teal hover:text-teal-dark">
              {t('login.skipToBooking')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-g20/30 bg-panel-mid/40 backdrop-blur-sm p-3">
      <div className="font-display font-bold text-2xl text-copper">{value}</div>
      <div className="text-[10px] text-g60 label-caps">{label}</div>
    </div>
  )
}
