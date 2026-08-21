import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

function Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose)
  if (!open) return null
  return (
    <div ref={ref} role="dialog">
      <button>first</button>
      <button>second</button>
      <button>third</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('moves initial focus to first focusable element', () => {
    render(<Modal open onClose={() => {}} />)
    expect(document.activeElement?.textContent).toBe('first')
  })

  it('calls onEscape when ESC pressed', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('wraps Tab from last → first', () => {
    render(<Modal open onClose={() => {}} />)
    const buttons = document.querySelectorAll('button')
    ;(buttons[2] as HTMLButtonElement).focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement?.textContent).toBe('first')
  })

  it('wraps Shift+Tab from first → last', () => {
    render(<Modal open onClose={() => {}} />)
    const buttons = document.querySelectorAll('button')
    ;(buttons[0] as HTMLButtonElement).focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement?.textContent).toBe('third')
  })
})
