import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Save, ArrowLeft, FileText } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBudgets } from '@/hooks/useBudgets'
import { ClientSelector } from '@/components/clients/ClientSelector'
import { BudgetItemsForm, type BudgetItemFormData } from '@/components/budgets/BudgetItemsForm'

interface BudgetFormData {
  title: string
  description: string
  client_id: string
}

export function NewBudget() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { canCreateBudget, fetchBudgets } = useBudgets()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<BudgetItemFormData[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    },
  ])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<BudgetFormData>()

  const selectedClientId = watch('client_id')

  const validateItems = () => {
    let hasErrors = false
    const newErrors: Record<string, string> = {}

    if (items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item ao orçamento'
      hasErrors = true
    }

    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`items.${index}.description`] = 'Descrição é obrigatória'
        hasErrors = true
      }
      if (item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] = 'Quantidade deve ser maior que zero'
        hasErrors = true
      }
      if (item.unit_price <= 0) {
        newErrors[`items.${index}.unit_price`] = 'Valor unitário deve ser maior que zero'
        hasErrors = true
      }
    })

    // Clear previous item errors
    Object.keys(errors).forEach(key => {
      if (key.startsWith('items.')) {
        clearErrors(key as keyof BudgetFormData)
      }
    })

    // Set new errors
    Object.entries(newErrors).forEach(([key, message]) => {
      setError(key as keyof BudgetFormData, { message })
    })

    return !hasErrors
  }

  const onSubmit = async (data: BudgetFormData) => {
    if (!user || !canCreateBudget()) {
      return
    }

    if (!validateItems()) {
      return
    }

    setIsSubmitting(true)

    try {
      const publicUuid = uuidv4()

      // Create budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          client_id: data.client_id,
          title: data.title,
          description: data.description,
          status: 'pending',
          public_uuid: publicUuid,
        })
        .select()
        .single()

      if (budgetError) {
        throw budgetError
      }

      // Create budget items
      const budgetItems = items.map(item => ({
        budget_id: budget.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: itemsError } = await supabase
        .from('budget_items')
        .insert(budgetItems)

      if (itemsError) {
        throw itemsError
      }

      // Refresh budgets list
      await fetchBudgets()

      // Redirect to budget view
      navigate(`/budgets/${budget.id}`)
    } catch (error) {
      console.error('Error creating budget:', error)
      setError('root', { message: 'Erro ao criar orçamento. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClientChange = (clientId: string) => {
    setValue('client_id', clientId)
    clearErrors('client_id')
  }

  if (!canCreateBudget()) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Limite de orçamentos atingido
          </h3>
          <p className="text-yellow-700 mb-4">
            Você atingiu o limite de 10 orçamentos por mês do plano gratuito.
          </p>
          <button
            onClick={() => navigate('/billing')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Orçamento</h1>
            <p className="text-gray-600">Crie um orçamento profissional para seu cliente</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.root.message}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Orçamento *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Título é obrigatório' })}
                placeholder="Ex: Desenvolvimento de website"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <ClientSelector
                value={selectedClientId}
                onChange={handleClientChange}
                error={errors.client_id?.message}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Descreva os detalhes do projeto ou serviço..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Budget Items */}
          <BudgetItemsForm
            items={items}
            onChange={setItems}
            errors={errors as Record<string, string>}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Criar Orçamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}