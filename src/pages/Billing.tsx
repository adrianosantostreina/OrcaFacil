import { Check, CreditCard, Settings, Star, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStripe } from '@/hooks/useStripe'
import { STRIPE_PLANS } from '@/lib/stripe'

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      'Até 10 orçamentos por mês',
      'Clientes ilimitados',
      'Aprovação por link',
      'Impressão básica',
    ],
    limitations: [
      'Limite de 10 orçamentos/mês',
      'Sem personalização',
      'Sem notificações por email',
    ],
    plan: 'free' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para profissionais',
    features: [
      'Orçamentos ilimitados',
      'Logo personalizada',
      'Cor da marca personalizada',
      'Relatórios básicos',
      'Suporte por email',
    ],
    plan: 'pro' as const,
    popular: true,
    priceId: STRIPE_PLANS.pro.priceId,
  },
  {
    name: 'Premium',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para empresas',
    features: [
      'Tudo do Pro',
      'Notificações por email automáticas',
      'Relatórios avançados',
      'Suporte prioritário',
      'Integração com API',
    ],
    plan: 'premium' as const,
    popular: false,
    priceId: STRIPE_PLANS.premium.priceId,
  },
]

export function Billing() {
  const { user } = useAuth()
  const { createCheckoutSession, createPortalSession, loading, error } = useStripe()

  const currentPlan = user?.user_plan || 'free'

  const handleUpgrade = async (priceId: string) => {
    await createCheckoutSession(priceId)
  }

  const handleManageSubscription = async () => {
    await createPortalSession()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Planos e Preços</h1>
        <p className="text-gray-600 mt-2">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      {/* Current Plan */}
      {currentPlan !== 'free' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
              <p className="text-gray-600 capitalize">
                Você está no plano {currentPlan}
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Assinatura
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.plan
          const canUpgrade = plan.plan !== 'free' && currentPlan === 'free'
          const isDowngrade = 
            (plan.plan === 'free' && currentPlan !== 'free') ||
            (plan.plan === 'pro' && currentPlan === 'premium')

          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-sm border-2 p-6 ${
                plan.popular
                  ? 'border-primary-500 ring-1 ring-primary-500'
                  : isCurrentPlan
                  ? 'border-green-500'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Plano Atual
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Limitações:</p>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-gray-500">
                        • {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                  >
                    Plano Atual
                  </button>
                ) : canUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.priceId!)}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                        : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500'
                    }`}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2 inline" />
                        Fazer Upgrade
                      </>
                    )}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Alterar Plano
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-md text-sm font-medium cursor-not-allowed"
                  >
                    Plano Inferior
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Posso cancelar a qualquer momento?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">O que acontece se eu exceder o limite do plano gratuito?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Você será notificado quando atingir o limite e não poderá criar novos orçamentos até fazer upgrade ou aguardar o próximo mês.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Posso alterar meu plano depois?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento através do portal de assinatura.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>
          Precisa de ajuda? Entre em contato conosco em{' '}
          <a href="mailto:suporte@orcafacil.com" className="text-primary-600 hover:text-primary-700">
            suporte@orcafacil.com
          </a>
        </p>
      </div>
    </div>
  )
}