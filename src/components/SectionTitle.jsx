import { cn } from '../lib/utils'

const SectionTitle = ({
  title,
  description,
  action,
  className,
  children,
}) => (
  <div
    className={cn('flex flex-col gap-2 border-b border-slate-300 pb-5 text-start dark:border-slate-800', className)}
  >
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {description ? <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
    {children}
  </div>
)

export default SectionTitle

