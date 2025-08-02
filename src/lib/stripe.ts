import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripe = loadStripe(stripePublishableKey)

export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    price: 'R$ 29/mês',
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Orçamentos ilimitados',
      'Logo personalizada',
      'Cor da marca',
      'Relatórios básicos'
    ]
  },
  premium: {
    name: 'Premium',
    price: 'R$ 49/mês',
    priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
    features: [
      'Tudo do Pro',
      'Notificações por email',
      'Relatórios avançados',
      'Suporte prioritário'
    ]
  }
} as const