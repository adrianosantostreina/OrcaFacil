const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' })
    }

    // Get the user's Stripe customer ID from payments table
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (paymentError || !payment?.stripe_customer_id) {
      return res.status(404).json({ error: 'No active subscription found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: payment.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/billing`,
    })

    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}