const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId
  if (!userId) return

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const customer = await stripe.customers.retrieve(session.customer)
    
    // Determine plan based on price ID
    let plan = 'free'
    if (subscription.items.data[0]) {
      const priceId = subscription.items.data[0].price.id
      // Replace with your actual price IDs
      if (priceId === 'price_pro_monthly') plan = 'pro'
      if (priceId === 'price_premium_monthly') plan = 'premium'
    }

    // Update user plan
    await supabase
      .from('users')
      .update({ user_plan: plan })
      .eq('id', userId)

    // Create or update payment record
    await supabase
      .from('payments')
      .upsert({
        user_id: userId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        plan: plan,
        status: 'active',
        started_at: new Date(subscription.start_date * 1000).toISOString(),
      })

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer
  if (!customerId) return

  try {
    // Update payment status to active
    await supabase
      .from('payments')
      .update({ status: 'active' })
      .eq('stripe_customer_id', customerId)
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer
  if (!customerId) return

  try {
    // Update payment status to inactive
    await supabase
      .from('payments')
      .update({ status: 'inactive' })
      .eq('stripe_customer_id', customerId)

    // Optionally downgrade user to free plan after grace period
    // This can be implemented based on your business logic
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Get user ID from payment record
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (payment) {
      // Downgrade user to free plan
      await supabase
        .from('users')
        .update({ user_plan: 'free' })
        .eq('id', payment.user_id)

      // Update payment status
      await supabase
        .from('payments')
        .update({ 
          status: 'cancelled',
          ended_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscription.id)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}