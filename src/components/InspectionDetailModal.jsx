import * as Dialog from '@radix-ui/react-dialog'
import { HiOutlineXMark, HiOutlinePrinter, HiOutlineCalendar, HiOutlinePhone, HiOutlineUser } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'

import { CHECKUP_TYPES } from '../config/constants'
import { checklist } from '../data/checklist'

/**
 * Maps API section names back to form section names
 */
const API_TO_FORM_SECTION_MAP = {
  gearbox: 'gearboxBrakes',
  chassis: 'chassis4x4',
}

/**
 * Creates a lookup map from English name to checklist item
 */
const createNameToChecklistItemMap = () => {
  const map = new Map()
  Object.entries(checklist).forEach(([sectionKey, items]) => {
    items.forEach((item) => {
      map.set(item.en, { ...item, sectionKey })
    })
  })
  return map
}

const InspectionDetailModal = ({ open, onOpenChange, inspectionData }) => {
  const { t, i18n } = useTranslation()
  const languageKey = i18n.language === 'ar' ? 'ar' : 'en'
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US'

  if (!inspectionData) return null

  const { inspection, vehicle, customer } = inspectionData
  const nameToItemMap = createNameToChecklistItemMap()

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const checkupLabel =
    CHECKUP_TYPES.find((type) => type.id === inspection.inspectionType)?.translationKey ||
    CHECKUP_TYPES[0].translationKey

  // Map findings back to checklist items with proper translations
  const sectionSummaries = Object.entries(inspection.findings || {})
    .map(([apiSectionKey, findingNames]) => {
      // Map API section key back to form section key
      const formSectionKey = API_TO_FORM_SECTION_MAP[apiSectionKey] || apiSectionKey
      
      // Get checklist items for this section
      const sectionItems = checklist[formSectionKey] || []
      
      // Match finding names to checklist items
      const items = Array.isArray(findingNames)
        ? findingNames
            .map((name) => {
              const item = nameToItemMap.get(name)
              return item ? item[languageKey] : name
            })
            .filter(Boolean)
        : []

      return {
        id: formSectionKey,
        title: t(`inspection.sections.${formSectionKey}`),
        items,
      }
    })
    .filter((section) => section.items.length > 0)

  const customerFields = [
    { key: 'name', label: t('inspection.fields.clientName'), value: customer.name },
    { key: 'mobile', label: t('inspection.fields.mobileNumber'), value: customer.mobileNumber },
  ]

  const vehicleFields = [
    { key: 'carType', label: t('inspection.fields.carType'), value: vehicle.carType },
    { key: 'model', label: t('inspection.fields.model'), value: vehicle.model },
    { key: 'color', label: t('inspection.fields.color'), value: vehicle.color },
    { key: 'plateNumber', label: t('inspection.fields.plateNumber'), value: vehicle.plateNumber },
    { key: 'vin', label: t('inspection.fields.vin'), value: vehicle.vin },
    { key: 'crNumber', label: t('inspection.fields.crNumber'), value: vehicle.crNumber },
    { key: 'vatNumber', label: t('inspection.fields.vatNumber'), value: vehicle.vatNumber },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm print:hidden" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl print:static print:m-0 print:w-auto print:max-h-none print:max-w-none print:translate-x-0 print:translate-y-0 print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-6 print:border-b-0">
            <div className="flex-1">
              <Dialog.Title className="text-2xl font-semibold text-slate-900">
                {t('summary.title')}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Inspection ID: {inspection.id.slice(0, 8)}...
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-primary print:hidden">
              <HiOutlineXMark className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 print:overflow-visible print:p-0">
            <div className="grid gap-6 print:mt-4">
              {/* Customer Information */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:border print:bg-white">
                <div className="mb-4 flex items-center gap-2">
                  <HiOutlineUser className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {t('summary.customerDetails')}
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
                </div>
              </section>

              {/* Vehicle Information */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Vehicle Information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicleFields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {field.label}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {field.value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Inspection Details */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Inspection Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('inspection.sections.checkupType')}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {t(checkupLabel)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t('inspection.fields.date')}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {dateFormatter.format(new Date(inspection.inspectionDate))}
                    </span>
                  </div>
                  {inspection.odometerReading && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('inspection.fields.odometer')}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        {inspection.odometerReading.toLocaleString(locale)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created At
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {dateTimeFormatter.format(new Date(inspection.createdAt))}
                    </span>
                  </div>
                </div>
              </section>

              {/* Findings */}
              {sectionSummaries.length > 0 ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    {t('summary.selectedIssues')}
                  </h3>
                  <div className="space-y-4">
                    {sectionSummaries.map((section) => (
                      <div key={section.id} className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-700">
                          {section.title}
                        </h4>
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {section.items.map((item, index) => (
                            <li
                              key={`${section.id}-${index}`}
                              className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700"
                            >
                              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border print:shadow-none">
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    {t('summary.noIssues')}
                  </p>
                </section>
              )}

              {/* Notes */}
              {inspection.generalNotes && (
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:border print:bg-white">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">
                    {t('summary.notes')}
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {inspection.generalNotes}
                  </p>
                </section>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 p-6 print:border-t-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                <HiOutlinePrinter className="h-5 w-5" />
                {t('app.actions.print')}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default InspectionDetailModal
