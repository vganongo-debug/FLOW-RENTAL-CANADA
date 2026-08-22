import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'dark' | 'light'
  tagline?: boolean
  className?: string
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function FlowWordmark({ size = 'md', variant = 'dark', tagline, className }: Props) {
  const { t } = useTranslation()
  const dark = variant === 'dark'
  return (
    <div className={cn('inline-flex flex-col leading-none', className)}>
      <div className={cn('font-display font-semibold tracking-tight', SIZES[size])}>
        <span className={dark ? 'text-ivory' : 'text-ink'}>Flow</span>
        <span className="text-copper"> Rentals</span>
      </div>
      {tagline && (
        <span
          className={cn(
            'mt-1 italic font-display tracking-wide',
            dark ? 'text-g80' : 'text-g40',
            size === 'xl' ? 'text-xl' : 'text-sm'
          )}
        >
          {t('brand.tagline')}
        </span>
      )}
    </div>
  )
}
