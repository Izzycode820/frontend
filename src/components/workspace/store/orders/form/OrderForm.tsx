'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shadcn-ui/button'
import { Card } from '@/components/shadcn-ui/card'
import { ProductsSection } from './products'
import { PaymentSection } from './payment'
import { CustomerSection } from './customer'
import type { OrderItem } from './products'
import { Save } from 'lucide-react'

// Order form data structure
export interface OrderFormData {
  customer_id: string
  items: OrderItem[]
  payment_method: string
  shipping_cost: string
  tax_amount: string
  discount_amount: string
  notes?: string
  tags?: string[]
}

export interface OrderFormProps {
  initialData?: Partial<OrderFormData>
  onSubmit?: (data: OrderFormData) => void
  onSaveDraft?: (data: OrderFormData) => void
  isEditing?: boolean
  isLoading?: boolean
}

export function OrderForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isEditing = false,
  isLoading = false,
}: OrderFormProps) {
  const t = useTranslations('Orders.form')
  const [formData, setFormData] = useState<OrderFormData>({
    customer_id: '',
    items: [],
    payment_method: 'cash_on_delivery',
    shipping_cost: '0.00',
    tax_amount: '0.00',
    discount_amount: '0.00',
    notes: '',
    tags: [],
    ...initialData,
  })

  const updateFormData = (updates: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = () => {
    onSubmit?.(formData)
  }

  const handleSaveDraft = () => {
    onSaveDraft?.(formData)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Form Column */}
        <div className="flex-1 max-w-3xl space-y-6">
          {/* Products Section */}
          <ProductsSection
            items={formData.items}
            onItemsChange={(items) => updateFormData({ items })}
          />

          {/* Payment Section */}
          <PaymentSection
            items={formData.items}
            paymentMethod={formData.payment_method}
            onPaymentMethodChange={(payment_method: string) => updateFormData({ payment_method })}
          />
        </div>

        {/* Sidebar Column */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 space-y-6">
          {/* Notes Card - Placeholder */}
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('placeholders.notesSoon')}</p>
          </Card>

          {/* Customer Section */}
          <CustomerSection
            customerId={formData.customer_id}
            onCustomerIdChange={(customer_id) => updateFormData({ customer_id })}
          />

          {/* Markets Card - Placeholder */}
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('placeholders.marketsSoon')}</p>
          </Card>

          {/* Tags Card - Placeholder */}
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">{t('placeholders.tagsSoon')}</p>
          </Card>

          {/* Action Buttons */}
          <Card className="p-4 space-y-3 sticky top-6">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="flex-1 h-auto py-2 min-w-[140px]"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate sm:whitespace-normal text-xs sm:text-sm">
                  {t('actions.saveDraft')}
                </span>
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-auto py-2 min-w-[140px]"
                disabled={isLoading || formData.items.length === 0}
              >
                <span className="text-xs sm:text-sm">
                  {isLoading ? t('actions.creating') : (isEditing ? t('actions.updateOrder') : t('actions.createOrder'))}
                </span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
