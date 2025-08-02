import enMessages from '@/messages/en.json'
import nlMessages from '@/messages/nl.json'

export type Locale = 'en' | 'nl'
export const defaultLocale: Locale = 'en'
export const locales: Locale[] = ['en', 'nl']

export const messages = {
  en: enMessages,
  nl: nlMessages,
} as const
