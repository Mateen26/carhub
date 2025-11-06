import { useMemo } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as LabelPrimitive from '@radix-ui/react-label'
import { HiCheck } from 'react-icons/hi'

import { cn } from '../lib/utils'

const CheckboxGroup = ({
  items = [],
  value = [],
  onValueChange,
  columns = 1,
  name,
  disabled = false,
  className,
}) => {
  const itemMap = useMemo(() => new Set(value), [value])

  const handleToggle = (id) => {
    if (!onValueChange) return
    const next = new Set(itemMap)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onValueChange(Array.from(next))
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        {
          'md:grid-cols-2': columns === 2,
          'lg:grid-cols-3': columns === 3,
          'xl:grid-cols-4': columns >= 4,
        },
        className
      )}
    >
      {items.map((item) => {
        const checked = itemMap.has(item.id)
        const inputId = name ? `${name}-${item.id}` : item.id
        return (
          <LabelPrimitive.Root
            key={item.id}
            htmlFor={inputId}
            className={cn(
              'group relative flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/70 bg-white/90 p-4 text-sm shadow-sm transition hover:border-primary/60 hover:shadow-md',
              disabled && '!cursor-not-allowed opacity-60'
            )}
          >
            <CheckboxPrimitive.Root
              id={inputId}
              name={name}
              disabled={disabled}
              checked={checked}
              onCheckedChange={() => handleToggle(item.id)}
              className={cn(
                'mt-1 flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white'
              )}
            >
              <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                <HiCheck className="h-3.5 w-3.5" aria-hidden="true" />
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-slate-900">{item.label}</span>
              {item.description ? (
                <span className="text-xs text-slate-500">{item.description}</span>
              ) : null}
            </div>
          </LabelPrimitive.Root>
        )
      })}
    </div>
  )
}

export default CheckboxGroup

