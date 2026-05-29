import { AppProvider, useApp } from './context/AppContext'
import Onboarding from './pages/Onboarding'
import CircleApp from './pages/CircleApp'
import { CIRCLES } from './data/themes'

function Root() {
  const { user, loading, login, logout, updateUser } = useApp()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>🌍</div>
          <div style={{ fontSize: 14, color: '#B8860B', fontFamily: 'monospace' }}>Chargement FamilyX…</div>
        </div>
      </div>
    )
  }

  if (!user) return <Onboarding onLogin={login} />

  const circle = CIRCLES[user.circleId] || CIRCLES.family

  return (
    <CircleApp
      circle={circle}
      user={user}
      onLogout={logout}
      onUpdateUser={updateUser}
    />
  )
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
