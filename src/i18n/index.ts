import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from './locales/de.json'
import en from './locales/en.json'
import it from './locales/it.json'

const resources = {
  de: { translation: de },
  en: { translation: en },
  it: { translation: it },
}

export const availableLanguages = Object.keys(resources) as Array<keyof typeof resources>

let initialized = false

export function initI18n(language: string = 'de') {
  if (initialized) {
    if (i18n.language !== language) void i18n.changeLanguage(language)
    return i18n
  }
  void i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  initialized = true
  return i18n
}

export default i18n
