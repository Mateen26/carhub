import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import i18n, { supportedLanguages } from '../i18n'

const LanguageContext = createContext({
  language: 'en',
  availableLanguages: supportedLanguages,
  setLanguage: () => {},
})

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language || 'en')

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  const changeLanguage = useCallback((lng) => {
    if (lng === language) return
    const supported = supportedLanguages.find((item) => item.code === lng)
    if (!supported) return
    i18n.changeLanguage(supported.code)
  }, [language])

  const value = useMemo(
    () => ({ language, availableLanguages: supportedLanguages, setLanguage: changeLanguage }),
    [language, changeLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

