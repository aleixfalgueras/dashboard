'use client'

import { useLocale, useSetLocale, useTranslations } from '@/lib/translations/context'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { locales, type Locale } from '@/lib/translations'

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale()
  const setLocale = useSetLocale()

  const getLanguageName = (loc: Locale) => {
    switch (loc) {
      case 'en':
        return t('english')
      case 'nl':
        return t('dutch')
    }
  }

  const getCurrentLanguageName = () => getLanguageName(locale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentLanguageName()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {getLanguageName(loc)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}