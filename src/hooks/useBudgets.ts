import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Budget, BudgetWithDetails, BudgetItem } from '@/types/database'

interface UseBudgetsReturn {
  budgets: BudgetWithDetails[]
  loading: boolean
  error: string | null
  fetchBudgets: () => Promise<void>
  getBudgetStats: () => {
    total: number
    pending: number
    approved: number
    thisMonth: number
  }
  canCreateBudget: () => boolean
}

export function useBudgets(): UseBudgetsReturn {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          client:clients(*),
          budget_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (budgetsError) {
        throw budgetsError
      }

      const budgetsWithDetails: BudgetWithDetails[] = (budgetsData || []).map((budget) => {
        const items = budget.budget_items || []
        const total_amount = items.reduce((sum, item) => sum + item.total_price, 0)

        return {
          ...budget,
          client: budget.client,
          budget_items: items,
          total_amount,
        }
      })

      setBudgets(budgetsWithDetails)
    } catch (err) {
      console.error('Error fetching budgets:', err)
      setError('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const getBudgetStats = () => {
    const total = budgets.length
    const pending = budgets.filter(budget => budget.status === 'pending').length
    const approved = budgets.filter(budget => budget.status === 'approved').length
    
    // Count budgets created this month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const thisMonth = budgets.filter(budget => {
      const createdAt = new Date(budget.created_at)
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear
    }).length

    return { total, pending, approved, thisMonth }
  }

  const canCreateBudget = () => {
    if (!user) return false
    
    // Free users are limited to 10 budgets per month
    if (user.user_plan === 'free') {
      const stats = getBudgetStats()
      return stats.thisMonth < 10
    }
    
    // Pro and Premium users have unlimited budgets
    return true
  }

  useEffect(() => {
    if (user) {
      fetchBudgets()
    }
  }, [user])

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    getBudgetStats,
    canCreateBudget,
  }
}