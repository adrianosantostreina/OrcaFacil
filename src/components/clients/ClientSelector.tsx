import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, User, Mail, Phone, Check, X } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/types/database'

interface ClientSelectorProps {
  value: string | null
  onChange: (clientId: string) => void
  error?: string
}

interface ClientFormData {
  name: string
  email: string
  phone?: string
}

export function ClientSelector({ value, onChange, error }: ClientSelectorProps) {
  const { clients, createClient } = useClients()
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>()

  const selectedClient = clients.find(client => client.id === value)

  const handleCreateClient = async (data: ClientFormData) => {
    setIsCreating(true)

    const newClient = await createClient(data)

    if (newClient) {
      onChange(newClient.id)
      setShowNewClientForm(false)
      reset()
    }

    setIsCreating(false)
  }

  const handleCancelNewClient = () => {
    setShowNewClientForm(false)
    reset()
  }

  if (showNewClientForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Novo Cliente
          </label>
          <button
            type="button"
            onClick={handleCancelNewClient}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleCreateClient)} className="space-y-3">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Nome do cliente"
                {...register('name', { required: 'Nome é obrigatório' })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                placeholder="Email do cliente"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="tel"
                placeholder="Telefone (opcional)"
                {...register('phone')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Criar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelNewClient}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Cliente *
      </label>
      
      <div className="space-y-2">
        {clients.length > 0 && (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => setShowNewClientForm(true)}
          className="w-full flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </button>
      </div>

      {selectedClient && (
        <div className="bg-gray-50 rounded-md p-3 mt-2">
          <div className="text-sm">
            <p className="font-medium text-gray-900">{selectedClient.name}</p>
            <p className="text-gray-600">{selectedClient.email}</p>
            {selectedClient.phone && (
              <p className="text-gray-600">{selectedClient.phone}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
}