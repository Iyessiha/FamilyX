import { useState, useEffect } from 'react'
import { Card, Badge, Button } from '../../components/shared/UI'
import { PLANS, getUserPlan, getUserSubscription, activatePlan, cancelSubscription, formatExpiry } from '../../utils/subscriptionStore'
import { initPayment, verifyPayment, parsePaymentReturn, MONEROO_METHODS, COUNTRY_LABELS } from '../../utils/monerooService'

// ── Lock Gate ─────────────────────────────────────────────────────────────────
export function LockGate({ c, user, feature, children, fallback }) {
  const plan = getUserPlan(user?.id)
  const isLocked = !plan.limits[feature]
  const [showUpgrade, setShowUpgrade] = useState(false)
  if (!isLocked) return children
  return (
    <>
      <div onClick={() => setShowUpgrade(true)} style={{ position: 'relative', cursor: 'pointer' }}>
        <div style={{ filter: 'blur(3px) grayscale(60%)', pointerEvents: 'none', opacity: 0.5 }}>{fallback || children}</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${c.bg}cc`, borderRadius: 14 }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 4 }}>Fonctionnalité Premium</div>
          <div style={{ fontSize: 11, color: c.color1, textDecoration: 'underline' }}>Débloquer →</div>
        </div>
      </div>
      {showUpgrade && <SubscriptionPage c={c} user={user} onClose={() => setShowUpgrade(false)} modal />}
    </>
  )
}

// ── Payment Return Handler ─────────────────────────────────────────────────────
export function PaymentReturnHandler({ onDone }) {
  useEffect(() => {
    const { paymentId, paymentStatus, userId, planId, billing } = parsePaymentReturn()
    if (!paymentId) return
    if (paymentStatus === 'success') {
      verifyPayment(paymentId).then(result => {
        if (result.status === 'success') {
          activatePlan(userId, planId, billing, 'moneroo')
        }
        onDone && onDone(result.status)
      }).catch(() => onDone && onDone('error'))
    } else {
      onDone && onDone(paymentStatus)
    }
    // Clean URL
    window.history.replaceState({}, document.title, '/')
  }, [])
  return null
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, currentPlanId, billing, onSelect, c }) {
  const isCurrent = plan.id === currentPlanId
  const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly
  const priceEur = billing === 'yearly' ? plan.priceEur?.yearly : plan.priceEur?.monthly

  return (
    <div style={{ background: isCurrent ? `${plan.color}18` : c.surface, border: `2px solid ${isCurrent ? plan.color : plan.popular ? plan.color + '55' : c.border + '22'}`, borderRadius: 20, padding: '18px 14px', position: 'relative', flex: 1, minWidth: 0 }}>
      {plan.popular && !isCurrent && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, borderRadius: 20, padding: '3px 12px', fontSize: 10, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>⭐ Populaire</div>
      )}
      {isCurrent && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, borderRadius: 20, padding: '3px 12px', fontSize: 10, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Actuel</div>
      )}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>{plan.emoji}</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: c.text }}>{plan.name}</div>
        {price > 0 ? (
          <>
            <div style={{ fontSize: 22, fontWeight: 900, color: plan.color, lineHeight: 1.1, marginTop: 6 }}>
              {price.toLocaleString()}<span style={{ fontSize: 11, color: c.textMuted }}> XOF</span>
            </div>
            {priceEur && <div style={{ fontSize: 10, color: c.textMuted }}>≈ {priceEur} €</div>}
            <div style={{ fontSize: 10, color: c.textMuted }}>/{billing === 'yearly' ? 'an' : 'mois'}</div>
            {billing === 'yearly' && <div style={{ fontSize: 10, color: '#22c55e' }}>🎉 2 mois offerts</div>}
          </>
        ) : (
          <div style={{ fontSize: 18, fontWeight: 900, color: plan.color, marginTop: 6 }}>Gratuit</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, color: c.text, alignItems: 'flex-start' }}>
            <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}
          </div>
        ))}
        {plan.locked?.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, color: c.textSubtle, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0 }}>🔒</span>{f}
          </div>
        ))}
      </div>
      {!isCurrent ? (
        <button onClick={() => onSelect(plan)} style={{ width: '100%', background: plan.id === 'free' ? c.surface : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, border: plan.id === 'free' ? `1px solid ${c.border}33` : 'none', borderRadius: 12, padding: '10px', color: plan.id === 'free' ? c.textMuted : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: c.font }}>
          {plan.id === 'free' ? 'Rester gratuit' : `Choisir ${plan.name}`}
        </button>
      ) : (
        <div style={{ width: '100%', background: `${plan.color}14`, border: `1px solid ${plan.color}33`, borderRadius: 12, padding: '9px', textAlign: 'center', fontSize: 12, color: plan.color, fontWeight: 700 }}>Plan actuel ✓</div>
      )}
    </div>
  )
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ plan, billing, c, user, onClose }) {
  const [country, setCountry] = useState('CI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = billing === 'yearly' ? plan.price.yearly : plan.price.monthly
  const amountEur = billing === 'yearly' ? plan.priceEur?.yearly : plan.priceEur?.monthly

  const countryMethods = MONEROO_METHODS.filter(m => m.country === country)

  const handlePay = async () => {
    setError('')
    setLoading(true)
    try {
      const { checkoutUrl } = await initPayment({ user, plan, billing })
      // Redirect to Moneroo hosted checkout
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'initialisation du paiement.')
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#000000cc', display: 'flex', alignItems: 'flex-end', maxWidth: 430, margin: '0 auto' }}>
      <div style={{ background: c.bgSecond, borderRadius: '20px 20px 0 0', border: `1px solid ${c.border}33`, width: '100%', padding: '20px 20px 40px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, background: c.textSubtle, borderRadius: 2, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: c.text }}>Paiement {plan.emoji} {plan.name}</div>
            <div style={{ fontSize: 13, color: c.textMuted }}>{amount.toLocaleString()} XOF{amountEur ? ` · ${amountEur} €` : ''} /{billing === 'yearly' ? 'an' : 'mois'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Order summary */}
        <div style={{ background: `${plan.color}12`, border: `1px solid ${plan.color}33`, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{plan.emoji} FamilyX {plan.name}</div>
              <div style={{ fontSize: 12, color: c.textMuted }}>{billing === 'yearly' ? 'Facturation annuelle' : 'Facturation mensuelle'}</div>
              {billing === 'yearly' && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>🎉 2 mois offerts — économisez 17%</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: plan.color }}>{amount.toLocaleString()} XOF</div>
              {amountEur && <div style={{ fontSize: 11, color: c.textMuted }}>≈ {amountEur} €</div>}
            </div>
          </div>
        </div>

        {/* Country selector */}
        <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 10 }}>Votre pays</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {Object.entries(COUNTRY_LABELS).map(([code, label]) => (
            <button key={code} onClick={() => setCountry(code)} style={{
              background: country === code ? `${c.color1}18` : c.surface,
              border: `2px solid ${country === code ? c.color1 : c.border + '22'}`,
              borderRadius: 20, padding: '6px 12px', fontSize: 12,
              color: country === code ? c.color1 : c.textMuted,
              cursor: 'pointer', fontFamily: c.font, transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Payment methods for selected country */}
        <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 10 }}>
          Méthodes disponibles
        </div>
        {countryMethods.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {countryMethods.map(m => (
              <div key={m.id} style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 12, color: c.text }}>{m.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 20, padding: '10px', background: c.surface, borderRadius: 10 }}>
            💳 Paiement par carte bancaire internationale disponible.
          </div>
        )}

        {/* Info */}
        <div style={{ display: 'flex', gap: 8, background: '#051a10', border: '1px solid #22c55e33', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
          <span>🔒</span>
          <div style={{ fontSize: 11, color: '#86efac', lineHeight: 1.5 }}>
            Paiement sécurisé via <strong>Moneroo</strong> — agrégateur certifié PCI-DSS. Vous serez redirigé vers la page de paiement sécurisée. Aucune donnée bancaire n'est stockée sur nos serveurs.
          </div>
        </div>

        {/* Customer info */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: c.textMuted }}>
          <div style={{ marginBottom: 4 }}>📧 Facture envoyée à : <strong style={{ color: c.text }}>{user?.email}</strong></div>
          <div>👤 Compte : <strong style={{ color: c.text }}>{user?.name}</strong></div>
        </div>

        {error && (
          <div style={{ background: '#1a0505', border: '1px solid #ef444433', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 13, color: '#fca5a5', display: 'flex', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handlePay} disabled={loading} style={{
          width: '100%', background: loading ? c.surface : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
          border: 'none', borderRadius: 14, padding: '15px',
          color: loading ? c.textMuted : '#fff', fontSize: 15, fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: c.font,
          boxShadow: loading ? 'none' : `0 6px 24px ${plan.color}44`,
          transition: 'all 0.2s',
        }}>
          {loading ? '⏳ Connexion à Moneroo…' : `Payer ${amount.toLocaleString()} XOF via Moneroo →`}
        </button>

        <div style={{ fontSize: 10, color: c.textSubtle, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
          Annulable à tout moment · Renouvellement automatique · Remboursement sous 7 jours
        </div>
      </div>
    </div>
  )
}

// ── Main Subscription Page ─────────────────────────────────────────────────────
export default function SubscriptionPage({ c, user, onClose, modal }) {
  const [billing, setBilling] = useState('monthly')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const currentPlan = getUserPlan(user?.id)
  const sub = getUserSubscription(user?.id)

  const handleSelect = (plan) => {
    if (plan.id === 'free') { activatePlan(user?.id, 'free'); return }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  return (
    <div style={{ background: c.bg, minHeight: modal ? 'auto' : '100vh', fontFamily: c.font, padding: '20px 16px 40px' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: c.text }}>Abonnement ⭐</div>
          <div style={{ fontSize: 13, color: c.textMuted }}>Débloquez toutes les fonctionnalités</div>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 22, cursor: 'pointer' }}>✕</button>}
      </div>

      {/* Current plan */}
      <div style={{ background: `${currentPlan.color}12`, border: `1px solid ${currentPlan.color}44`, borderRadius: 14, padding: '12px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'monospace' }}>PLAN ACTUEL</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{currentPlan.emoji} FamilyX {currentPlan.name}</div>
          {sub?.expiresAt && <div style={{ fontSize: 11, color: c.textMuted }}>Expire le {formatExpiry(sub.expiresAt)}</div>}
          {!sub && <div style={{ fontSize: 11, color: c.textMuted }}>Fonctionnalités de base</div>}
        </div>
        {sub && (
          <button onClick={() => cancelSubscription(user?.id)} style={{ background: '#1a0505', border: '1px solid #ef444433', borderRadius: 10, padding: '6px 12px', color: '#ef4444', fontSize: 11, cursor: 'pointer', fontFamily: c.font }}>
            Annuler
          </button>
        )}
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 }}>
        {[['monthly', '🗓 Mensuel'], ['yearly', '📅 Annuel (-17%)']].map(([b, label]) => (
          <button key={b} onClick={() => setBilling(b)} style={{
            flex: 1, border: 'none', borderRadius: 10, padding: '10px',
            background: billing === b ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : 'transparent',
            color: billing === b ? '#fff' : c.textMuted,
            fontSize: 13, fontWeight: billing === b ? 700 : 400,
            cursor: 'pointer', fontFamily: c.font, transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {Object.values(PLANS).map(plan => (
          <PlanCard key={plan.id} plan={plan} currentPlanId={currentPlan.id} billing={billing} onSelect={handleSelect} c={c} />
        ))}
      </div>

      {/* Comparison table */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 12 }}>COMPARAISON DÉTAILLÉE</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '10px 12px', background: c.bg, borderBottom: `1px solid ${c.border}18` }}>
            <div style={{ fontSize: 10, color: c.textMuted, fontFamily: 'monospace' }}>FONCTIONNALITÉ</div>
            {Object.values(PLANS).map(p => (
              <div key={p.id} style={{ fontSize: 10, color: p.color, fontFamily: 'monospace', textAlign: 'center' }}>{p.emoji} {p.tag}</div>
            ))}
          </div>
          {[
            ['Membres', p => p.limits.members >= 999999 ? '∞' : p.limits.members],
            ['Stories/j', p => p.limits.storiesPerDay >= 999 ? '∞' : p.limits.storiesPerDay],
            ['Groupes', p => p.limits.groups >= 999 ? '∞' : p.limits.groups],
            ['Stockage', p => p.limits.storagesMb >= 20000 ? '20 Go' : p.limits.storagesMb >= 5000 ? '5 Go' : '50 Mo'],
            ['Export PDF', p => p.limits.canExportTree ? '✓' : '✗'],
            ['Annuaire', p => p.limits.canSeeDirectory ? '✓' : '✗'],
            ['Stats', p => p.limits.canSeeStats ? '✓' : '✗'],
            ['Badge ✓', p => p.limits.verifiedBadge ? '✓' : '✗'],
          ].map(([label, getter], i) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '8px 12px', borderBottom: `1px solid ${c.border}10`, background: i % 2 === 0 ? 'transparent' : `${c.border}04` }}>
              <div style={{ fontSize: 11, color: c.textMuted }}>{label}</div>
              {Object.values(PLANS).map(p => {
                const val = getter(p)
                return (
                  <div key={p.id} style={{ fontSize: 11, textAlign: 'center', color: val === '✗' ? c.textSubtle : val === '✓' ? '#22c55e' : c.text, fontWeight: val !== '✗' ? 600 : 400 }}>{val}</div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Moneroo trust */}
      <div style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 14, padding: '14px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>🔒 PAIEMENT SÉCURISÉ VIA MONEROO</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['🟠 Orange Money', '🟡 MTN MoMo', '🔵 Wave', '🟢 Moov Money', '💳 Carte bancaire', '🌍 12+ pays'].map(m => (
            <div key={m} style={{ background: c.bg, border: `1px solid ${c.border}18`, borderRadius: 20, padding: '4px 10px', fontSize: 11, color: c.textMuted }}>{m}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: c.textSubtle, marginTop: 8 }}>Certifié PCI-DSS · Annulable à tout moment · Remboursement sous 7 jours</div>
      </div>

      {showPayment && selectedPlan && (
        <PaymentModal plan={selectedPlan} billing={billing} c={c} user={user} onClose={() => setShowPayment(false)} />
      )}
    </div>
  )
}
