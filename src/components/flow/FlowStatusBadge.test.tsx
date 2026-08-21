import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FlowStatusBadge } from './FlowStatusBadge'

describe('FlowStatusBadge', () => {
  it('renders children', () => {
    render(<FlowStatusBadge tone="active">Checked-in</FlowStatusBadge>)
    expect(screen.getByText('Checked-in')).toBeInTheDocument()
  })

  it('applies the active tone class', () => {
    const { container } = render(<FlowStatusBadge tone="active">Live</FlowStatusBadge>)
    expect(container.firstChild).toHaveClass('bg-teal')
  })

  it('applies the cancelled tone class', () => {
    const { container } = render(<FlowStatusBadge tone="cancelled">Off</FlowStatusBadge>)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toMatch(/bg-red/)
  })

  it('shows a dot when requested', () => {
    const { container } = render(<FlowStatusBadge tone="info" dot>Info</FlowStatusBadge>)
    const dot = container.querySelector('span > span')
    expect(dot).toBeTruthy()
    expect(dot?.className).toMatch(/rounded-full/)
  })
})
