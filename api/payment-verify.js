// api/payment-verify.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { paymentId } = req.query
  if (!paymentId) return res.status(400).json({ error: 'paymentId requis' })

  const secretKey = process.env.MONEROO_SECRET_KEY
  if (!secretKey) return res.status(500).json({ error: 'Clé non configurée' })

  try {
    const response = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data?.message || 'Erreur' })

    return res.status(200).json({
      status: data.data.status,     // 'success' | 'failed' | 'pending'
      amount: data.data.amount,
      currency: data.data.currency,
      metadata: data.data.metadata,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Erreur vérification paiement' })
  }
}
