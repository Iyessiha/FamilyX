// src/utils/monerooService.js
// Frontend → appelle nos fonctions Vercel serverless (jamais Moneroo directement)

const API_BASE = import.meta.env.VITE_API_BASE || ''

// ── Initialiser un paiement ───────────────────────────────────────────────────
export async function initPayment({ user, plan, billing }) {
  // XOF = pas de centimes (devise sans décimales)
  // Moneroo sandbox accepte le montant tel quel en XOF
  const amount = billing === 'yearly' ? plan.price.yearly : plan.price.monthly

  const body = {
    amount,
    currency: 'XOF',
    description: `FamilyX ${plan.name} — Abonnement ${billing === 'yearly' ? 'Annuel' : 'Mensuel'}`,
    customer: {
      email: user.email,
      firstName: user.name?.split(' ')[0] || 'Client',
      lastName: user.name?.split(' ').slice(1).join(' ') || 'FamilyX',
      phone: user.phone || undefined,
    },
    planId: plan.id,
    billing,
    userId: user.id,
    metadata: { circleId: user.circleId },
  }

  const res = await fetch(`${API_BASE}/api/payment-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur initialisation paiement')
  return data // { paymentId, checkoutUrl }
}

// ── Vérifier un paiement ──────────────────────────────────────────────────────
export async function verifyPayment(paymentId) {
  const res = await fetch(`${API_BASE}/api/payment-verify?paymentId=${paymentId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur vérification')
  return data // { status, amount, currency, metadata }
}

// ── Parser les params de retour après redirect ────────────────────────────────
export function parsePaymentReturn() {
  const params = new URLSearchParams(window.location.search)
  return {
    paymentId: params.get('paymentId'),
    paymentStatus: params.get('paymentStatus'), // 'success' | 'failed' | 'pending'
    userId: params.get('userId'),
    planId: params.get('planId'),
    billing: params.get('billing'),
  }
}

// ── Méthodes de paiement par pays ─────────────────────────────────────────────
export const MONEROO_METHODS = [
  // Côte d'Ivoire
  { id: 'orange_ci',   label: 'Orange Money CI',  emoji: '🟠', country: 'CI', currency: 'XOF' },
  { id: 'mtn_ci',      label: 'MTN MoMo CI',       emoji: '🟡', country: 'CI', currency: 'XOF' },
  { id: 'wave_ci',     label: 'Wave CI',            emoji: '🔵', country: 'CI', currency: 'XOF' },
  { id: 'moov_ci',     label: 'Moov Money CI',      emoji: '🟢', country: 'CI', currency: 'XOF' },
  // Sénégal
  { id: 'orange_sn',   label: 'Orange Money SN',   emoji: '🟠', country: 'SN', currency: 'XOF' },
  { id: 'wave_sn',     label: 'Wave SN',            emoji: '🔵', country: 'SN', currency: 'XOF' },
  { id: 'free_sn',     label: 'Free Money SN',      emoji: '🟣', country: 'SN', currency: 'XOF' },
  // Cameroun
  { id: 'orange_cm',   label: 'Orange Money CM',   emoji: '🟠', country: 'CM', currency: 'XAF' },
  { id: 'mtn_cm',      label: 'MTN MoMo CM',        emoji: '🟡', country: 'CM', currency: 'XAF' },
  // Burkina Faso
  { id: 'orange_bf',   label: 'Orange Money BF',   emoji: '🟠', country: 'BF', currency: 'XOF' },
  { id: 'moov_bf',     label: 'Moov Money BF',      emoji: '🟢', country: 'BF', currency: 'XOF' },
  // Bénin
  { id: 'mtn_bj',      label: 'MTN MoMo BJ',        emoji: '🟡', country: 'BJ', currency: 'XOF' },
  { id: 'moov_bj',     label: 'Moov Money BJ',      emoji: '🟢', country: 'BJ', currency: 'XOF' },
  // Carte internationale
  { id: 'card',        label: 'Carte bancaire',     emoji: '💳', country: 'INT', currency: 'EUR' },
]

export const COUNTRY_LABELS = {
  CI: "🇨🇮 Côte d'Ivoire",
  SN: '🇸🇳 Sénégal',
  CM: '🇨🇲 Cameroun',
  BF: '🇧🇫 Burkina Faso',
  BJ: '🇧🇯 Bénin',
  INT: '🌍 International',
}
