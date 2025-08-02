export type UserPlan = 'free' | 'pro' | 'premium'
export type BudgetStatus = 'pending' | 'approved'
export type PaymentStatus = 'active' | 'inactive' | 'cancelled'

export interface User {
  id: string
  email: string
  full_name: string
  user_plan: UserPlan
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  client_id: string
  title: string
  description: string
  status: BudgetStatus
  approved_at?: string
  public_uuid: string
  created_at: string
  client?: Client
  budget_items?: BudgetItem[]
}

export interface BudgetItem {
  id: string
  budget_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Payment {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: UserPlan
  status: PaymentStatus
  started_at: string
  ended_at?: string
}

export interface BudgetWithDetails extends Budget {
  client: Client
  budget_items: BudgetItem[]
  total_amount: number
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at'>
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>
      }
      budget_items: {
        Row: BudgetItem
        Insert: Omit<BudgetItem, 'id'>
        Update: Partial<Omit<BudgetItem, 'id'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id'>
        Update: Partial<Omit<Payment, 'id'>>
      }
    }
  }
}