import { forwardRef } from 'react'

import { cn } from '../lib/utils'

const baseClassName =
  'rounded-2xl bg-white shadow-card ring-1 ring-slate-300 dark:bg-[#121212] dark:ring-slate-800 dark:shadow-none'

const Card = forwardRef(({ className, ...props }, ref) => (
  <section ref={ref} className={cn(baseClassName, className)} {...props} />
))

Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }) => (
  <header
    className={cn('flex flex-col space-y-1.5 border-b border-slate-300 px-6 py-5 dark:border-slate-800', className)}
    {...props}
  />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight text-slate-900 dark:text-white', className)} {...props} />
)

export const CardSubtitle = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={cn('px-6 py-5', className)} {...props} />
)

export default Card

