import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CENTER_INFO } from '../config/constants'
import { cn } from '../lib/utils'
import LanguageSwitcher from './LanguageSwitcher'
import NavTabs from './NavTabs'

const Header = ({ className }) => {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg print:hidden',
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                {isArabic ? CENTER_INFO.name.ar : CENTER_INFO.name.en}
              </span>
              <span className="text-sm text-slate-500">
                {isArabic ? CENTER_INFO.tagline.ar : CENTER_INFO.tagline.en}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
          </div>
        </div>
        <NavTabs />
      </div>
    </header>
  )
}

export default Header

