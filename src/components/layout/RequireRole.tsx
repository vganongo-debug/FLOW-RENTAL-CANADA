import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { Role } from '../../lib/types'

/**
 * Contrôle d'accès au niveau de la route.
 *
 * AppLayout ne vérifiait que la présence d'une session. La barre latérale
 * masquait bien les liens hors périmètre, mais masquer un lien n'interdit
 * pas d'atteindre l'URL : un client connecté pouvait ouvrir /admin/security
 * en la tapant. Chaque groupe de routes déclare désormais les profils qui y
 * ont droit, et le rendu est refusé au lieu d'être seulement caché.
 *
 * Ce garde-fou vit dans le navigateur : il empêche une navigation, pas un
 * appel d'API. La ligne de défense qui compte reste l'autorisation
 * côté serveur, à écrire quand un vrai backend remplacera la couche
 * simulée de src/lib/api.ts.
 */
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        className="min-h-[40vh] flex items-center justify-center text-g40 dark:text-g60"
        role="status"
        aria-live="polite"
      >
        <span className="animate-pulse text-sm label-caps">Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!roles.includes(user.role)) {
    // Renvoyé vers sa propre page d'accueil plutôt que vers une page
    // d'erreur : l'utilisateur est légitime, c'est la destination qui ne
    // l'est pas. `replace` évite de piéger le bouton Retour sur une boucle.
    return <Navigate to={homeFor(user.role)} replace />
  }

  return <Outlet />
}

/**
 * Page d'accueil par profil. Dupliqué depuis ROLE_HOMES des données de
 * démonstration pour que le contrôle d'accès ne dépende pas d'un jeu de
 * données remplaçable.
 */
function homeFor(role: Role): string {
  switch (role) {
    case 'superadmin':
      return '/admin/portfolio'
    case 'hotel_manager':
      return '/hotels/dashboard'
    case 'car_agent':
      return '/fleet/dashboard'
    case 'reward_manager':
      return '/rewards/members'
    case 'guest':
    default:
      return '/booking/search'
  }
}
