// ── Plans definition ──────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    tag: 'FREE',
    price: { monthly: 0, yearly: 0 },
    color: '#555',
    emoji: '🆓',
    limits: {
      members: 10,
      storiesPerDay: 1,
      groups: 2,
      generations: 3,
      storagesMb: 50,
      canExportTree: false,
      canSeeDirectory: false,
      canSeeStats: false,
      verifiedBadge: false,
      prioritySupport: false,
    },
    features: [
      '10 membres max',
      '1 story par jour',
      '2 groupes',
      '3 générations',
      '50 Mo de stockage',
      'Messagerie illimitée',
      'Recherche par ID',
    ],
    locked: [
      'Export PDF arbre généalogique',
      'Annuaire complet',
      'Statistiques',
      'Badge vérifié ✓',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tag: 'PREMIUM',
    price: { monthly: 2500, yearly: 25000 }, // FCFA
    priceEur: { monthly: 3.99, yearly: 39.99 },
    color: '#B8860B',
    emoji: '⭐',
    popular: true,
    limits: {
      members: 50,
      storiesPerDay: 10,
      groups: 10,
      generations: 999,
      storagesMb: 5000,
      canExportTree: true,
      canSeeDirectory: true,
      canSeeStats: false,
      verifiedBadge: true,
      prioritySupport: false,
    },
    features: [
      '50 membres max',
      '10 stories par jour',
      '10 groupes',
      'Arbre illimité',
      '5 Go de stockage',
      'Export PDF arbre',
      'Annuaire complet',
      'Badge vérifié ✓',
    ],
    locked: [
      'Statistiques avancées',
      'Support prioritaire',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tag: 'PRO',
    price: { monthly: 7500, yearly: 75000 },
    priceEur: { monthly: 11.99, yearly: 119.99 },
    color: '#7c3aed',
    emoji: '💎',
    limits: {
      members: 999999,
      storiesPerDay: 999,
      groups: 999,
      generations: 999,
      storagesMb: 20000,
      canExportTree: true,
      canSeeDirectory: true,
      canSeeStats: true,
      verifiedBadge: true,
      prioritySupport: true,
    },
    features: [
      'Membres illimités',
      'Stories illimitées',
      'Groupes illimités',
      '20 Go de stockage',
      'Export PDF arbre',
      'Annuaire complet',
      'Statistiques avancées',
      'Badge vérifié ✓',
      'Support prioritaire 24/7',
    ],
    locked: [],
  },
}

// ── Subscription store (localStorage) ────────────────────────────────────────
const SUB_KEY = 'familyx_subscriptions'

function getSubs() {
  try { return JSON.parse(localStorage.getItem(SUB_KEY) || '{}') } catch { return {} }
}
function saveSubs(subs) {
  localStorage.setItem(SUB_KEY, JSON.stringify(subs))
}

export function getUserPlan(userId) {
  const subs = getSubs()
  const sub = subs[userId]
  if (!sub) return PLANS.free
  if (sub.expiresAt && Date.now() > sub.expiresAt) {
    // Expired → downgrade to free
    delete subs[userId]
    saveSubs(subs)
    return PLANS.free
  }
  return PLANS[sub.planId] || PLANS.free
}

export function getUserSubscription(userId) {
  const subs = getSubs()
  return subs[userId] || null
}

export function activatePlan(userId, planId, billing, paymentMethod) {
  const subs = getSubs()
  const plan = PLANS[planId]
  if (!plan || planId === 'free') {
    delete subs[userId]
    saveSubs(subs)
    return { success: true }
  }
  const durationMs = billing === 'yearly' ? 365 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000
  subs[userId] = {
    planId,
    billing,
    paymentMethod,
    activatedAt: Date.now(),
    expiresAt: Date.now() + durationMs,
    autoRenew: true,
    transactions: [
      {
        id: 'tx' + Date.now(),
        date: Date.now(),
        amount: billing === 'yearly' ? plan.price.yearly : plan.price.monthly,
        currency: 'FCFA',
        method: paymentMethod,
        status: 'success',
      }
    ],
  }
  saveSubs(subs)
  return { success: true }
}

export function cancelSubscription(userId) {
  const subs = getSubs()
  if (subs[userId]) {
    subs[userId].autoRenew = false
    saveSubs(subs)
  }
  return { success: true }
}

export function checkLimit(userId, limitKey) {
  const plan = getUserPlan(userId)
  return plan.limits[limitKey]
}

export function isFeatureLocked(userId, featureKey) {
  const plan = getUserPlan(userId)
  return !plan.limits[featureKey]
}

export function formatExpiry(ts) {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
