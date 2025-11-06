import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/translation.json'
import ar from './locales/ar/translation.json'

export const supportedLanguages = [
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'ar', label: 'ع', dir: 'rtl' },
]

const fallbackLng = 'en'

const storedLng =
  typeof window !== 'undefined'
    ? localStorage.getItem('anas-inspection-language')
    : undefined

const initialLng =
  storedLng && supportedLanguages.some((lang) => lang.code === storedLng)
    ? storedLng
    : fallbackLng

const resources = {
  en: { translation: en },
  ar: { translation: ar },
}

export const applyLanguageMetadata = (language) => {
  const active =
    supportedLanguages.find((lang) => lang.code === language) ||
    supportedLanguages[0]

  if (typeof document !== 'undefined') {
    document.documentElement.lang = active.code
    document.documentElement.dir = active.dir
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  })

applyLanguageMetadata(initialLng)

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('anas-inspection-language', lng)
  }
  applyLanguageMetadata(lng)
})

export default i18n

