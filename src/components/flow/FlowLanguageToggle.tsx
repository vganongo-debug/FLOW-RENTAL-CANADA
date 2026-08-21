import { useLocale } from '../../context/LocaleContext'
import { cn } from '../../lib/utils'

export function FlowLanguageToggle() {
  const { language, setLanguage } = useLocale()
  return (
    <div className="inline-flex border border-g20/60 rounded-input overflow-hidden">
      {(['EN', 'FR'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={cn(
            'px-2 py-1 text-xs font-medium label-caps transition',
            language === l
              ? 'bg-teal text-white'
              : 'bg-transparent text-g40 hover:text-ink dark:hover:text-ivory'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
