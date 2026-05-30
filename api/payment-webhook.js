// api/payment-webhook.js — Moneroo webhook → Supabase
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // service role pour bypass RLS
  )

  const { event, data } = req.body
  if (!event || !data) return res.status(400).json({ error: 'Payload invalide' })

  try {
    if (event === 'payment.success') {
      const { id: monerooTxId, metadata, amount, currency } = data
      const { userId, planId, billing } = metadata || {}
      if (!userId || !planId) return res.status(200).json({ received: true })

      const durationMs = billing === 'yearly'
        ? 365 * 24 * 3600 * 1000
        : 30  * 24 * 3600 * 1000
      const expiresAt = new Date(Date.now() + durationMs).toISOString()

      // Upsert subscription
      await supabase.from('subscriptions').upsert({
        user_id: userId, plan_id: planId, billing,
        status: 'active', payment_method: 'moneroo',
        moneroo_tx_id: monerooTxId,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt,
        auto_renew: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      // Log transaction
      await supabase.from('payment_transactions').insert({
        user_id: userId, moneroo_tx_id: monerooTxId,
        plan_id: planId, billing, amount, currency: currency || 'XOF',
        status: 'success', payment_method: 'moneroo', metadata,
      })

      // Notification in-app
      await supabase.from('notifications').insert({
        user_id: userId, type: 'subscription',
        title: '🎉 Abonnement activé !',
        body: `Votre plan ${planId} est actif jusqu'au ${new Date(expiresAt).toLocaleDateString('fr-FR')}`,
        emoji: '⭐',
        data: { planId, billing, monerooTxId },
      })

    } else if (event === 'payment.failed') {
      const { id: monerooTxId, metadata, amount, currency } = data
      const { userId, planId, billing } = metadata || {}
      if (userId) {
        await supabase.from('payment_transactions').insert({
          user_id: userId, moneroo_tx_id: monerooTxId,
          plan_id: planId, billing, amount, currency: currency || 'XOF',
          status: 'failed', payment_method: 'moneroo', metadata,
        })
        await supabase.from('notifications').insert({
          user_id: userId, type: 'subscription',
          title: 'Paiement échoué',
          body: 'Votre paiement n\'a pas abouti. Veuillez réessayer.',
          emoji: '❌',
          data: { planId, monerooTxId },
        })
      }
    }
  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).json({ received: true })
}
