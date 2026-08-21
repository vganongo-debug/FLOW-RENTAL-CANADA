import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '../i18n'

beforeAll(() => {
  // jsdom doesn't implement Intl with currency display by default, but
  // node 24 ships full ICU, so Intl.NumberFormat works out of the box.
  // Stub matchMedia for components that read it (none currently, but
  // recharts can probe it).
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: () => {}, removeListener: () => {},
        addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
      }),
    })
  }
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
