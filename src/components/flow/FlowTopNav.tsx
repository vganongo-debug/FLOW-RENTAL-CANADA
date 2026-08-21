import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, LogOut, MessageSquare, Moon, Search, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { NOTIFICATIONS } from '../../lib/sampleData'
import { cn } from '../../lib/utils'
import { messages as msgApi } from '../../lib/api'
import { FlowLanguageToggle } from './FlowLanguageToggle'
import { FlowCurrencySelector } from './FlowCurrencySelector'
import { FlowCountrySelector } from './FlowCountrySelector'

export function FlowTopNav() {
  const { user, logout } = useAuth()
  const { mode, toggle } = useTheme()
  const { t } = useTranslation()
  const [bellOpen, setBellOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  // Poll the unread badge every 15s + on focus. Production would push via
  // WebSocket / SSE instead.
  useEffect(() => {
    if (!user) return
    let alive = true
    const refresh = () => {
      msgApi.unreadCount(user.id).then((n) => { if (alive) setUnread(n) })
    }
    refresh()
    const id = setInterval(refresh, 15_000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => { alive = false; clearInterval(id); window.removeEventListener('focus', onFocus) }
  }, [user])

  return (
    <header className="sticky top-0 z-20 h-14 bg-white dark:bg-panel-mid border-b border-g20/60 flex items-center px-4 gap-3">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-g40" />
          <input
            type="search"
            placeholder={t('common.search')}
            className="w-full pl-9 pr-3 py-2 text-sm bg-ivory dark:bg-panel border border-g20/60 rounded-input text-ink dark:text-ivory placeholder:text-g40 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FlowLanguageToggle />
        <FlowCountrySelector />
        <FlowCurrencySelector />

        <button
          onClick={toggle}
          className="p-2 rounded-input text-g40 hover:text-ink dark:hover:text-ivory hover:bg-ivory dark:hover:bg-panel"
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={mode === 'dark'}
        >
          {mode === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        <Link
          to="/messages"
          aria-label={`Messages · ${unread} unread`}
          className="p-2 rounded-input text-g40 hover:text-ink dark:hover:text-ivory hover:bg-ivory dark:hover:bg-panel relative"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-copper text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="p-2 rounded-input text-g40 hover:text-ink dark:hover:text-ivory hover:bg-ivory dark:hover:bg-panel relative"
            aria-label={`${t('common.notifications')} · ${NOTIFICATIONS.length} new`}
            aria-haspopup="true"
            aria-expanded={bellOpen}
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-copper" aria-hidden="true" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-panel-mid border border-g20/60 rounded-card shadow-panel animate-flow-fade overflow-hidden">
              <div className="px-4 py-2 border-b border-g20/60 label-caps text-g40">{t('common.notifications')}</div>
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="px-4 py-3 border-b border-g20/40 last:border-0 hover:bg-ivory dark:hover:bg-panel">
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        'mt-1.5 h-2 w-2 rounded-full',
                        n.type === 'warning' ? 'bg-copper' : 'bg-teal'
                      )} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-ink dark:text-ivory">{n.title}</div>
                        <div className="text-xs text-g40 dark:text-g60">{n.body}</div>
                        <div className="text-[10px] text-g40 mt-1">{n.time}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserOpen((o) => !o)}
            aria-label="User menu"
            aria-haspopup="true"
            aria-expanded={userOpen}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-input hover:bg-ivory dark:hover:bg-panel"
          >
            <span className="h-7 w-7 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold">
              {user?.avatarInitials}
            </span>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-medium text-ink dark:text-ivory leading-tight">{user?.name}</div>
              <div className="text-[10px] text-g40 leading-tight">{user && t(`roles.${user.role}`)}</div>
            </div>
          </button>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-panel-mid border border-g20/60 rounded-card shadow-panel animate-flow-fade overflow-hidden">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink dark:text-ivory hover:bg-ivory dark:hover:bg-panel"
              >
                <LogOut className="h-4 w-4" /> {t('common.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
