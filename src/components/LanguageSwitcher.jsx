import { useTranslation } from 'react-i18next'

import { useLanguage } from '../contexts/LanguageContext'
import { cn } from '../lib/utils'

const LanguageSwitcher = ({ className }) => {
  const { language, availableLanguages, setLanguage } = useLanguage()
  const { t } = useTranslation()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="sr-only">{t('language.switcherLabel')}</span>
      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
        {availableLanguages.map((lang) => {
          const isActive = lang.code === language

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'min-w-[2.75rem] rounded-full px-3 py-1.5 font-medium transition',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-slate-600 hover:text-primary'
              )}
            >
              {lang.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LanguageSwitcher

