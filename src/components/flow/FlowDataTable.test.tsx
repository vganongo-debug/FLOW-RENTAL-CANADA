import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlowDataTable, type Column } from './FlowDataTable'

interface Row extends Record<string, unknown> {
  id: string
  name: string
  amount: number
}

const rows: Row[] = [
  { id: 'r-1', name: 'Charlie', amount: 30 },
  { id: 'r-2', name: 'Alice',   amount: 10 },
  { id: 'r-3', name: 'Bob',     amount: 20 },
]

const cols: Column<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'amount', header: 'Amount', align: 'right' },
]

describe('FlowDataTable', () => {
  it('renders all rows by default', () => {
    render(<FlowDataTable<Row> data={rows} columns={cols} rowKey={(r) => r.id} />)
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('sorts ascending then descending on header click', () => {
    render(<FlowDataTable<Row> data={rows} columns={cols} rowKey={(r) => r.id} />)
    const nameHeader = screen.getByRole('button', { name: /Name/i })
    fireEvent.click(nameHeader)
    let cells = screen.getAllByRole('row').slice(1).map((tr) => tr.children[0].textContent)
    expect(cells).toEqual(['Alice', 'Bob', 'Charlie'])
    fireEvent.click(nameHeader)
    cells = screen.getAllByRole('row').slice(1).map((tr) => tr.children[0].textContent)
    expect(cells).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('shows empty state when no rows', () => {
    render(<FlowDataTable<Row> data={[]} columns={cols} rowKey={(r) => r.id} />)
    expect(screen.getByText(/No records found|Aucun résultat/i)).toBeInTheDocument()
  })

  it('fires onRowClick', () => {
    let clicked: Row | null = null
    render(<FlowDataTable<Row> data={rows} columns={cols} rowKey={(r) => r.id} onRowClick={(r) => { clicked = r }} />)
    fireEvent.click(screen.getByText('Alice').closest('tr')!)
    expect(clicked).not.toBeNull()
    expect((clicked as unknown as Row).name).toBe('Alice')
  })
})
