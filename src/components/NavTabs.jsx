import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { cn } from '../lib/utils'

const navItems = [
  { value: '/dashboard', labelKey: 'app.nav.dashboard' },
  { value: '/inspection', labelKey: 'app.nav.inspection' },
]

const resolvePath = (pathname) => {
  if (!pathname || pathname === '/') return '/inspection'
  const match = navItems.find((item) => pathname.startsWith(item.value))
  return match ? match.value : '/inspection'
}

const NavTabs = ({ className }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const value = resolvePath(location.pathname)

  return (
    <Tabs.Root
      value={value}
      onValueChange={(next) => navigate(next)}
      className={cn('w-full', className)}
    >
      <Tabs.List className="inline-flex gap-2 rounded-full border border-slate-300 bg-white p-1 text-sm shadow-md dark:border-slate-800 dark:bg-[#121212] dark:shadow-none">
        {navItems.map((item) => {
          const isActive = value === item.value

          return (
            <Tabs.Trigger
              key={item.value}
              value={item.value}
              className={cn(
                'min-w-[8rem] rounded-full px-5 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
                isActive
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary'
              )}
            >
              {t(item.labelKey)}
            </Tabs.Trigger>
          )
        })}
      </Tabs.List>
    </Tabs.Root>
  )
}

export default NavTabs

