import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireRole } from './RequireRole'
import { AuthProvider } from '../../context/AuthContext'
import { SAMPLE_USERS } from '../../lib/sampleData'
import type { Role } from '../../lib/types'

/**
 * Masquer un lien dans la barre latérale n'empêche pas d'atteindre l'URL.
 * Ces tests vérifient le refus effectif, pas la discrétion de la navigation.
 */
function seedSession(role: Role) {
  const user = SAMPLE_USERS.find((u) => u.role === role)
  if (!user) throw new Error(`Aucun utilisateur de démonstration pour ${role}`)
  window.localStorage.setItem(
    'flow-os.session',
    JSON.stringify({ token: 'tok_test', user, expiresAt: Date.now() + 3_600_000 })
  )
}

function renderGuarded(path: string, roles: Role[]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<RequireRole roles={roles} />}>
            <Route path="/admin/security" element={<div>ÉCRAN SÉCURITÉ</div>} />
          </Route>
          <Route path="/booking/search" element={<div>RECHERCHE PUBLIQUE</div>} />
          <Route path="/hotels/dashboard" element={<div>TABLEAU DE BORD HÔTEL</div>} />
          <Route path="/login" element={<div>CONNEXION</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('RequireRole', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem('flow-os.seed-version', '2026.08-ca')
  })

  it('laisse passer un profil autorisé', async () => {
    seedSession('superadmin')
    renderGuarded('/admin/security', ['superadmin'])
    expect(await screen.findByText('ÉCRAN SÉCURITÉ')).toBeInTheDocument()
  })

  it('refuse un client qui tape /admin/security dans la barre d adresse', async () => {
    seedSession('guest')
    renderGuarded('/admin/security', ['superadmin'])
    expect(await screen.findByText('RECHERCHE PUBLIQUE')).toBeInTheDocument()
    expect(screen.queryByText('ÉCRAN SÉCURITÉ')).not.toBeInTheDocument()
  })

  it('refuse un profil authentifié mais hors périmètre', async () => {
    seedSession('hotel_manager')
    renderGuarded('/admin/security', ['superadmin'])
    expect(await screen.findByText('TABLEAU DE BORD HÔTEL')).toBeInTheDocument()
    expect(screen.queryByText('ÉCRAN SÉCURITÉ')).not.toBeInTheDocument()
  })

  it('renvoie vers la connexion sans session', async () => {
    renderGuarded('/admin/security', ['superadmin'])
    expect(await screen.findByText('CONNEXION')).toBeInTheDocument()
  })
})
