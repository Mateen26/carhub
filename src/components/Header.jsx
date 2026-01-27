import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CENTER_INFO } from '../config/constants'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../lib/utils'
import LanguageSwitcher from './LanguageSwitcher'
import NavTabs from './NavTabs'
import { ThemeToggle } from './ThemeToggle'

import logoArabic from '../assets/logo-arabic.jpeg'
import logoArabicLight from '../assets/logo-arabic-light.png'
import logoEnglish from '../assets/logo-english.jpeg'
import logoEnglishLight from '../assets/logo-english-light.png'

const Header = ({ className }) => {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const isArabic = i18n.language === 'ar'
  const isLight = theme === 'light'

  const logoAr = isLight ? logoArabicLight : logoArabic
  const logoEn = isLight ? logoEnglishLight : logoEnglish

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm backdrop-blur-lg print:hidden dark:border-secondary dark:bg-background/80 dark:shadow-none',
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/inspection" className="flex flex-col">
              <img
                src={isArabic ? logoAr : logoEn}
                alt={isArabic ? CENTER_INFO.name.ar : CENTER_INFO.name.en}
                className="h-24 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
        {/* <NavTabs /> */}
      </div>
    </header>
  )
}

export default Header

