import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Fond sur lequel la marque est posee.
   *   'auto'  — suit le theme (defaut) : encre en clair, ivoire en sombre
   *   'dark'  — fond sombre fixe (heros, pied de page)
   *   'light' — fond clair fixe
   */
  variant?: 'auto' | 'dark' | 'light'
  tagline?: boolean
  className?: string
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function FlowWordmark({ size = 'md', variant = 'auto', tagline, className }: Props) {
  const { t } = useTranslation()
  // En 'auto' la couleur suit le theme. Un variant fixe sur un fond qui,
  // lui, change avec le theme donnait un mot « Flow » ivoire sur fond
  // papier : un contraste de 1,03:1, donc illisible.
  const wordClass =
    variant === 'auto' ? 'text-ink dark:text-ivory' : variant === 'dark' ? 'text-ivory' : 'text-ink'
  const taglineClass =
    variant === 'auto' ? 'text-g40 dark:text-g80' : variant === 'dark' ? 'text-g80' : 'text-g40'
  return (
    <div className={cn('inline-flex flex-col leading-none', className)}>
      <div className={cn('font-display font-semibold tracking-tight', SIZES[size])}>
        <span className={wordClass}>Flow</span>
        <span className="text-copper"> Rentals</span>
      </div>
      {tagline && (
        <span
          className={cn(
            'mt-1 italic font-display tracking-wide',
            taglineClass,
            size === 'xl' ? 'text-xl' : 'text-sm'
          )}
        >
          {t('brand.tagline')}
        </span>
      )}
    </div>
  )
}
