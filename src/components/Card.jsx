import { forwardRef } from 'react'

import { cn } from '../lib/utils'

const baseClassName =
  'rounded-2xl bg-white/90 shadow-card backdrop-blur-sm ring-1 ring-slate-200'

const Card = forwardRef(({ className, ...props }, ref) => (
  <section ref={ref} className={cn(baseClassName, className)} {...props} />
))

Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }) => (
  <header
    className={cn('flex flex-col space-y-1.5 border-b border-slate-200/60 px-6 py-5', className)}
    {...props}
  />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />
)

export const CardSubtitle = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={cn('px-6 py-5', className)} {...props} />
)

export default Card

