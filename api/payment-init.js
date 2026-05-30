// api/payment-init.js
// Vercel Serverless Function — never expose MONEROO_SECRET_KEY client-side

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { amount, currency, description, customer, planId, billing, userId, metadata } = req.body

  if (!amount || !currency || !customer?.email) {
    return res.status(400).json({ error: 'Paramètres manquants (amount, currency, customer.email)' })
  }

  // Clé Moneroo — injectée via variable d'env Vercel
  const secretKey = process.env.MONEROO_SECRET_KEY || 'pvk_sandbox_o1f62u|01KSW8XCDX79PSH9YE3A42WDP4'
  const appUrl = process.env.APP_URL || 'http://localhost:5173'

  console.log('[Moneroo] Init payment:', { planId, billing, userId, amount, currency })

  try {
    const response = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
        customer: {
          email: customer.email,
          first_name: customer.firstName || customer.name?.split(' ')[0] || 'Client',
          last_name: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || 'FamilyX',
          phone: customer.phone || undefined,
        },
        return_url: `${appUrl}/payment-return?userId=${userId}&planId=${planId}&billing=${billing}`,
        metadata: {
          userId,
          planId,
          billing,
          ...metadata,
        },
      }),
    })

    const data = await response.json()
    console.log('[Moneroo] Response:', data)

    if (!response.ok) {
      console.error('[Moneroo] Error:', data)
      return res.status(response.status).json({ error: data?.message || 'Erreur Moneroo' })
    }

    return res.status(200).json({
      paymentId: data.data.id,
      checkoutUrl: data.data.checkout_url,
    })
  } catch (err) {
    console.error('[Moneroo] Exception:', err)
    return res.status(500).json({ error: "Erreur serveur lors de l'initialisation du paiement." })
  }
}
