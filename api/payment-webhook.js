// api/payment-webhook.js
// Moneroo enverra POST ici après chaque paiement
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { event, data } = req.body

  // Événements Moneroo : payment.success | payment.failed | payment.pending
  if (event === 'payment.success') {
    const { id: paymentId, metadata } = data
    const { userId, planId, billing } = metadata || {}

    console.log(`✅ Paiement confirmé: ${paymentId} — user ${userId} → plan ${planId}/${billing}`)

    // Ici en production : mettre à jour votre base de données (Supabase, Firebase, etc.)
    // await db.subscriptions.upsert({ userId, planId, billing, paymentId, activatedAt: new Date() })
  }

  if (event === 'payment.failed') {
    const { id: paymentId, metadata } = data
    console.log(`❌ Paiement échoué: ${paymentId}`)
  }

  return res.status(200).json({ received: true })
}
