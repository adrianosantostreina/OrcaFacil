import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Client } from '@/types/database'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  fetchClients: () => Promise<void>
  createClient: (client: Omit<Client, 'id' | 'user_id' | 'created_at'>) => Promise<Client | null>
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client | null>
  deleteClient: (id: string) => Promise<boolean>
}

export function useClients(): UseClientsReturn {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setClients(data || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'user_id' | 'created_at'>): Promise<Client | null> => {
    if (!user) return null

    try {
      const { data, error: createError } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      setClients(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return data
    } catch (err) {
      console.error('Error creating client:', err)
      setError('Erro ao criar cliente')
      return null
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>): Promise<Client | null> => {
    try {
      const { data, error: updateError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setClients(prev => 
        prev.map(client => 
          client.id === id ? data : client
        ).sort((a, b) => a.name.localeCompare(b.name))
      )
      return data
    } catch (err) {
      console.error('Error updating client:', err)
      setError('Erro ao atualizar cliente')
      return null
    }
  }

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setClients(prev => prev.filter(client => client.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting client:', err)
      setError('Erro ao excluir cliente')
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  }
}