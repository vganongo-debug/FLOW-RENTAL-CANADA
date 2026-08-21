import { useEffect, useRef } from 'react'

/**
 * Trap focus inside the returned ref while `active` is true.
 * - Initial focus on the first focusable element
 * - Tab / Shift+Tab wrap inside the container
 * - ESC calls `onEscape` if provided
 * - Restores focus to the previously active element on unmount/deactivate
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean, onEscape?: () => void) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active || !ref.current) return
    const root = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const selector = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(selector))
      .filter((el) => {
        if (el.hasAttribute('inert') || el.hasAttribute('hidden')) return false
        // Skip elements explicitly hidden via display:none.
        // We avoid offsetParent here so jsdom (no layout engine) doesn't
        // wrongly filter out everything.
        const style = typeof window !== 'undefined' && (window as Window).getComputedStyle
          ? window.getComputedStyle(el) : null
        if (style?.display === 'none' || style?.visibility === 'hidden') return false
        return true
      })

    const first = focusables()[0]
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const firstEl = els[0]
      const lastEl = els[els.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [active, onEscape])

  return ref
}
