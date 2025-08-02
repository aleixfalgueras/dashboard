'use client'

import { useTranslations } from '@/lib/translations/context'

export function FallbackMessage() {
  const t = useTranslations('homepage')

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{t('welcome')}</h1>
        <p className="text-gray-600">{t('contactAdmin')}</p>
      </div>
    </div>
  )
}