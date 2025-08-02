import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from './useAuth'

interface UseStripeReturn {
  createCheckoutSession: (priceId: string) => Promise<void>
  createPortalSession: () => Promise<void>
  loading: boolean
  error: string | null
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

export function useStripe(): UseStripeReturn {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const { sessionId, error: sessionError } = await response.json()

      if (sessionError) {
        throw new Error(sessionError)
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe não foi carregado')
      }

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (redirectError) {
        throw new Error(redirectError.message)
      }
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão de pagamento')
    } finally {
      setLoading(false)
    }
  }

  const createPortalSession = async () => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const { url, error: portalError } = await response.json()

      if (portalError) {
        throw new Error(portalError)
      }

      window.location.href = url
    } catch (err) {
      console.error('Error creating portal session:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão do portal')
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    createPortalSession,
    loading,
    error,
  }
}