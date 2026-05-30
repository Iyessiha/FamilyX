import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Onboarding from './pages/Onboarding'
import CircleApp from './pages/CircleApp'
import { CIRCLES } from './data/themes'
import { activatePlan } from './utils/subscriptionStore'
import { parsePaymentReturn, verifyPayment } from './utils/monerooService'

function PaymentReturnGuard({ children }) {
  const { user, login } = useApp()
  
  useEffect(() => {
    const params = parsePaymentReturn()
    if (!params.paymentId) return
    // Verify and activate plan
    verifyPayment(params.paymentId)
      .then(result => {
        if (result.status === 'success') {
          activatePlan(params.userId, params.planId, params.billing, 'moneroo')
        }
      })
      .catch(() => {})
      .finally(() => {
        // Clean URL regardless
        window.history.replaceState({}, document.title, '/')
      })
  }, [])

  return children
}

function Root() {
  const { user, loading, login, logout, updateUser } = useApp()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12, display: 'inline-block', animation: 'spin 1.2s linear infinite' }}>🌍</div>
          <div style={{ fontSize: 14, color: '#B8860B', fontFamily: 'monospace', letterSpacing: 2 }}>FamilyX…</div>
        </div>
      </div>
    )
  }

  if (!user) return <Onboarding onLogin={login} />

  const circle = CIRCLES[user.circleId] || CIRCLES.family
  return <CircleApp circle={circle} user={user} onLogout={logout} onUpdateUser={updateUser} />
}

export default function App() {
  return (
    <AppProvider>
      <PaymentReturnGuard>
        <Root />
      </PaymentReturnGuard>
    </AppProvider>
  )
}
