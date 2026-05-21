import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import de from './locales/de.json'

let initialized = false

export function initI18n(language: string = 'de') {
  if (initialized) {
    if (i18n.language !== language) void i18n.changeLanguage(language)
    return i18n
  }
  void i18n.use(initReactI18next).init({
    resources: { de: { translation: de } },
    lng: language,
    fallbackLng: 'de',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  initialized = true
  return i18n
}

export default i18n
