import * as Dialog from '@radix-ui/react-dialog'
import { HiOutlinePrinter, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'

import { CHECKUP_TYPES } from '../config/constants'
import { checklist } from '../data/checklist'

const SummaryModal = ({ 
  open, 
  onOpenChange, 
  data, 
  onConfirm, 
  onPrint, 
  isSubmitting = false,
  submitError = null 
}) => {
  const { t, i18n } = useTranslation()
  const languageKey = i18n.language === 'ar' ? 'ar' : 'en'

  if (!data) return null

  const checkupLabel =
    CHECKUP_TYPES.find((type) => type.id === data.checkupType)?.translationKey ||
    CHECKUP_TYPES[0].translationKey

  const customerFields = [
    { key: 'clientName', label: t('inspection.fields.clientName'), value: data.clientName },
    { key: 'mobileNumber', label: t('inspection.fields.mobileNumber'), value: data.mobileNumber },
    { key: 'carType', label: t('inspection.fields.carType'), value: data.carType },
    { key: 'model', label: t('inspection.fields.model'), value: data.model },
    { key: 'color', label: t('inspection.fields.color'), value: data.color },
    { key: 'plateNumber', label: t('inspection.fields.plateNumber'), value: data.plateNumber },
    { key: 'vin', label: t('inspection.fields.vin'), value: data.vin },
    { key: 'crNumber', label: t('inspection.fields.crNumber'), value: data.crNumber },
    { key: 'vatNumber', label: t('inspection.fields.vatNumber'), value: data.vatNumber },
    {
      key: 'odometer',
      label: t('inspection.fields.odometer'),
      value: Number.isFinite(data.odometer) ? data.odometer.toLocaleString(i18n.language) : '',
    },
    { key: 'date', label: t('inspection.fields.date'), value: data.date },
  ]

  const sectionSummaries = Object.keys(checklist)
    .map((sectionId) => {
      const selectedIds = data.checklist?.[sectionId] || []
      const items = checklist[sectionId]
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item[languageKey])
      return {
        id: sectionId,
        title: t(`inspection.sections.${sectionId}`),
        items,
      }
    })
    .filter((section) => section.items.length > 0)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm print:hidden" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl print:static print:m-0 print:w-auto print:max-h-none print:max-w-none print:translate-x-0 print:translate-y-0 print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-6 print:border-b-0">
            <div>
              <Dialog.Title className="text-2xl font-semibold text-slate-900">
                {t('summary.title')}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                {t('summary.printHint')}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-primary print:hidden">
              <HiOutlineXMark className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 print:overflow-visible print:p-0">
            <div className="grid gap-6 print:mt-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:border print:bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                {t('summary.customerDetails')}
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {customerFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {field.value || '—'}
                    </span>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('inspection.sections.checkupType')}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {t(checkupLabel)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none">
              <h3 className="text-lg font-semibold text-slate-900">
                {t('summary.selectedIssues')}
              </h3>
              {sectionSummaries.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  {t('summary.noIssues')}
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {sectionSummaries.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700">
                        {section.title}
                      </h4>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700"
                          >
                            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:border print:bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                {t('summary.notes')}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {data.notes?.length ? data.notes : '—'}
              </p>
            </section>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 p-6 print:border-t-0">
            {submitError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 print:hidden">
                <p className="text-sm font-medium text-red-800">{submitError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
            <button
              type="button"
              onClick={onPrint}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlinePrinter className="h-5 w-5" />
              {t('app.actions.print')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('app.actions.submitting') || 'Submitting...'}
                </>
              ) : (
                <>
                  <HiOutlineCheck className="h-5 w-5" />
                  {t('app.actions.confirmSave')}
                </>
              )}
            </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SummaryModal

