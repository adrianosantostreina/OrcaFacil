import { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'

export interface BudgetItemFormData {
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface BudgetItemsFormProps {
  items: BudgetItemFormData[]
  onChange: (items: BudgetItemFormData[]) => void
  errors?: Record<string, string>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function BudgetItemsForm({ items, onChange, errors }: BudgetItemsFormProps) {
  const [localItems, setLocalItems] = useState<BudgetItemFormData[]>(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  useEffect(() => {
    onChange(localItems)
  }, [localItems, onChange])

  const addItem = () => {
    const newItem: BudgetItemFormData = {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    }
    setLocalItems([...localItems, newItem])
  }

  const removeItem = (index: number) => {
    if (localItems.length > 1) {
      setLocalItems(localItems.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof BudgetItemFormData, value: string | number) => {
    const updated = [...localItems]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-calculate total price when quantity or unit price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? Number(value) : updated[index].quantity
      const unitPrice = field === 'unit_price' ? Number(value) : updated[index].unit_price
      updated[index].total_price = quantity * unitPrice
    }

    setLocalItems(updated)
  }

  const calculateSubtotal = () => {
    return localItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Itens do Orçamento *
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Item
        </button>
      </div>

      <div className="space-y-3">
        {localItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Item {index + 1}
              </span>
              {localItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Descrição do item/serviço"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors?.[`items.${index}.description`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`items.${index}.description`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors?.[`items.${index}.quantity`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`items.${index}.quantity`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Unitário
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors?.[`items.${index}.unit_price`] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[`items.${index}.unit_price`]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-right">
                <span className="text-sm text-gray-600">Total: </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="bg-primary-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-lg font-medium text-primary-900">
              Subtotal
            </span>
          </div>
          <span className="text-2xl font-bold text-primary-900">
            {formatCurrency(calculateSubtotal())}
          </span>
        </div>
      </div>

      {errors?.items && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{errors.items}</p>
        </div>
      )}
    </div>
  )
}