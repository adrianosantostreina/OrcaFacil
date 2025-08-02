import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, FileText, Calendar, User, Mail, Phone, Check, Printer } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { BudgetWithDetails } from '@/types/database'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function PublicBudget() {
  const { publicUuid } = useParams<{ publicUuid: string }>()
  const [budget, setBudget] = useState<BudgetWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    if (publicUuid) {
      fetchBudget()
    }
  }, [publicUuid])

  const fetchBudget = async () => {
    if (!publicUuid) return

    try {
      setLoading(true)
      setError(null)

      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          client:clients(*),
          budget_items(*),
          user:users(full_name, user_plan)
        `)
        .eq('public_uuid', publicUuid)
        .single()

      if (budgetError) {
        throw budgetError
      }

      if (!budgetData) {
        setError('Orçamento não encontrado')
        return
      }

      const items = budgetData.budget_items || []
      const total_amount = items.reduce((sum: number, item: any) => sum + item.total_price, 0)

      setBudget({
        ...budgetData,
        client: budgetData.client,
        budget_items: items,
        total_amount,
      })
    } catch (err) {
      console.error('Error fetching budget:', err)
      setError('Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!budget) return

    setIsApproving(true)

    try {
      const { error } = await supabase
        .from('budgets')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', budget.id)

      if (error) {
        throw error
      }

      // Update local state
      setBudget({
        ...budget,
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Error approving budget:', err)
      setError('Erro ao aprovar orçamento')
    } finally {
      setIsApproving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Orçamento não encontrado'}
          </h3>
          <p className="text-gray-600">
            Verifique se o link está correto ou entre em contato com quem enviou este orçamento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6 print:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OrçaFácil</h1>
                <p className="text-gray-600">Orçamento Profissional</p>
              </div>
            </div>
            <div className="flex space-x-2 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </button>
            </div>
          </div>

          {budget.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Orçamento Aprovado
                  </h3>
                  <p className="text-sm text-green-700">
                    Aprovado em {formatDate(budget.approved_at!)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Budget Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6 print:shadow-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes do Orçamento
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Título:</span>
                  <p className="text-gray-900">{budget.title}</p>
                </div>
                {budget.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Descrição:</span>
                    <p className="text-gray-900">{budget.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Data:</span>
                  <p className="text-gray-900">{formatDate(budget.created_at)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                    budget.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {budget.status === 'approved' ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Cliente
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{budget.client.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{budget.client.email}</span>
                </div>
                {budget.client.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{budget.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Budget Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden print:shadow-none">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Itens do Orçamento</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unit.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budget.budget_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Total Geral:
                  </td>
                  <td className="px-6 py-4 text-lg font-bold text-gray-900 text-right">
                    {formatCurrency(budget.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Section */}
        {budget.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center print:hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aprove este orçamento
            </h3>
            <p className="text-gray-600 mb-6">
              Ao aprovar, você confirma que aceita os termos e valores apresentados neste orçamento.
            </p>
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Check className="h-5 w-5 mr-2" />
              )}
              Aprovar Orçamento
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8 print:hidden">
          <p>© 2024 OrçaFácil. Orçamento gerado automaticamente.</p>
        </div>
      </div>
    </div>
  )
}