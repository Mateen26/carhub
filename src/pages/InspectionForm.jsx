import { useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiCheck, HiOutlineCheckCircle, HiOutlineXMark } from 'react-icons/hi2'
import * as RadioGroup from '@radix-ui/react-radio-group'

import Card from '../components/Card'
import SectionTitle from '../components/SectionTitle'
import CheckboxGroup from '../components/CheckboxGroup'
import SummaryModal from '../components/SummaryModal'
import {
  CENTER_INFO,
  CHECKUP_TYPES,
  LEGAL_NOTICE_KEYS,
} from '../config/constants'
import { checklist } from '../data/checklist'
import { cn } from '../lib/utils'
import { createInspection } from '../services/api'
import { transformInspectionData } from '../utils/transformInspectionData'

const SECTION_DEFINITIONS = [
  { id: 'customer', translationKey: 'inspection.sections.customer' },
  { id: 'checkupType', translationKey: 'inspection.sections.checkupType' },
  { id: 'engine', translationKey: 'inspection.sections.engine' },
  { id: 'gearboxBrakes', translationKey: 'inspection.sections.gearboxBrakes' },
  { id: 'electrical', translationKey: 'inspection.sections.electrical' },
  { id: 'undercarriage', translationKey: 'inspection.sections.undercarriage' },
  { id: 'body', translationKey: 'inspection.sections.body' },
  { id: 'chassis4x4', translationKey: 'inspection.sections.chassis4x4' },
  { id: 'notes', translationKey: 'inspection.sections.notes' },
]

const createChecklistDefaults = () =>
  Object.keys(checklist).reduce((acc, key) => {
    acc[key] = []
    return acc
  }, {})

const defaultValues = {
  clientName: '',
  mobileNumber: '',
  carType: '',
  model: '',
  color: '',
  plateNumber: '',
  vin: '',
  odometer: '',
  date: '',
  crNumber: CENTER_INFO.crNumber,
  vatNumber: CENTER_INFO.vatNumber,
  checkupType: 'engine',
  checklist: createChecklistDefaults(),
  notes: '',
}

const checklistSections = new Set(Object.keys(checklist))

const inputBaseClasses =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-[#121212] dark:text-slate-200 dark:focus:ring-primary/40'

const textareaBaseClasses =
  'min-h-[140px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-[#121212] dark:text-slate-200 dark:focus:ring-primary/40'

const FormInput = ({
  name,
  label,
  register,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  options,
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <input
      id={name}
      type={type}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      {...register(name, options)}
      className={inputBaseClasses}
    />
    {error ? (
      <span className="text-xs font-medium text-red-500">{error.message}</span>
    ) : null}
  </label>
)

const FormTextarea = ({ name, label, register, error, placeholder, options }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    <textarea
      id={name}
      placeholder={placeholder}
      {...register(name, options)}
      className={textareaBaseClasses}
    />
    {error ? (
      <span className="text-xs font-medium text-red-500">{error.message}</span>
    ) : null}
  </label>
)

const InspectionForm = () => {
  const { t, i18n } = useTranslation()
  const {
    handleSubmit,
    watch,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    shouldUnregister: false,
  })

  const [activeSection, setActiveSection] = useState(SECTION_DEFINITIONS[0].id)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const contentRef = useRef(null)

  const onSubmit = (values) => {
    setSubmittedData(values)
    setSubmitError(null)
    setSubmitSuccess(false)
    setIsSummaryOpen(true)
  }

  const handleConfirm = async () => {
    if (!submittedData) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Transform form data to API format
      const apiPayload = transformInspectionData(submittedData)
      
      // Submit to API
      await createInspection(apiPayload)
      
      // Success - close modal, reset form, and show success message
      setIsSummaryOpen(false)
      reset(defaultValues)
      setSubmittedData(null)
      setActiveSection(SECTION_DEFINITIONS[0].id) // Reset to first section
      setSubmitSuccess(true)
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      // Handle error
      setSubmitError(error.message || 'Failed to submit inspection. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchAllFields = watch()
  const languageKey = i18n.language === 'ar' ? 'ar' : 'en'
  const validationMessages = useMemo(
    () => ({
      required: t('validation.required'),
      invalidMobile: t('validation.invalidMobile'),
      selectOne: t('validation.selectOne'),
    }),
    [t]
  )

  const mobileNavButtonClasses = (isActive) =>
    cn(
      'inline-flex min-h-[50px] min-w-[9rem] shrink-0 items-center justify-center rounded-full border px-5 py-2.5 text-center text-sm font-semibold leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      isActive
        ? 'border-transparent bg-primary text-white shadow'
        : 'border-slate-300 bg-white text-slate-600 shadow-sm hover:text-primary dark:border-slate-800 dark:bg-[#121212] dark:shadow-none dark:text-slate-400 dark:hover:text-primary'
    )

  const desktopNavButtonClasses = (isActive) =>
    cn(
      'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      isActive
        ? 'border-transparent bg-primary text-white ring-1 ring-primary/40 shadow'
        : 'border-slate-300 bg-white text-slate-600 shadow-sm hover:text-primary dark:border-slate-800 dark:bg-[#121212] dark:shadow-none dark:text-slate-400 dark:hover:text-primary'
    )

  const sectionList = useMemo(
    () =>
      SECTION_DEFINITIONS.map((section) => ({
        ...section,
        label: t(section.translationKey),
      })),
    [t]
  )

  const isSectionCompleted = (sectionId) => {
    const formData = watchAllFields

    if (sectionId === 'customer') {
      const customerFields = [
        'clientName',
        'mobileNumber',
        'carType',
        'model',
        'color',
        'plateNumber',
        'vin',
        'odometer',
        'date',
      ]
      return customerFields.some((field) => {
        const value = formData[field]
        return value !== undefined && value !== null && value !== ''
      })
    }

    if (sectionId === 'checkupType') {
      return formData.checkupType && formData.checkupType !== ''
    }

    if (checklistSections.has(sectionId)) {
      const selectedItems = formData.checklist?.[sectionId] || []
      return Array.isArray(selectedItems) && selectedItems.length > 0
    }

    if (sectionId === 'notes') {
      return formData.notes && formData.notes.trim() !== ''
    }

    return false
  }

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        if (window.innerWidth < 1024) {
          // Mobile: scroll to form container
          contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          // Desktop: scroll to the specific section card
          const sectionElement = document.getElementById(sectionId)
          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('inspection.title')}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          {t('inspection.subtitle')}
        </p>
      </div>

      {submitSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30">
          <div className="flex items-start gap-3">
            <HiOutlineCheckCircle className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {t('messages.success.inspectionCreated')}
              </h3>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                {t('messages.success.inspectionCreatedDescription')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="shrink-0 rounded-full p-1 text-emerald-600 transition hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
              aria-label="Dismiss"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[280px,1fr] lg:items-start">
        <nav className="-mx-4 border-b border-slate-300 pb-4 lg:mx-0 lg:border-b-0 lg:pr-6 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-x-auto px-4 lg:hidden">
            {sectionList.map((section) => {
              const isActive = activeSection === section.id
              const isCompleted = isSectionCompleted(section.id)
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionSelect(section.id)}
                  className={mobileNavButtonClasses(isActive)}
                >
                  <span className="flex items-center gap-2">
                    {isCompleted && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded  bg-[#6f6767]">
                        <HiCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      </span>
                    )}
                    {section.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="sticky top-28 hidden lg:flex lg:flex-col lg:gap-2">
            {sectionList.map((section) => {
              const isActive = activeSection === section.id
              const isCompleted = isSectionCompleted(section.id)
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionSelect(section.id)}
                  className={desktopNavButtonClasses(isActive)}
                >
                  <span className="flex items-center gap-2">
                    {isCompleted && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded  bg-[#6f6767]">
                        <HiCheck className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                      </span>
                    )}
                    {section.label}
                  </span>
                  <span className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                  )}>
                    {checklistSections.has(section.id) && Array.isArray(watchAllFields?.checklist?.[section.id])
                      ? watchAllFields.checklist[section.id].length
                      : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        <form ref={contentRef} className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          {sectionList.map((section) =>
            section.id === activeSection ? (
              <Card key={section.id} className="p-6" id={section.id}>
              <SectionTitle title={section.label} />
              {section.id === 'customer' && (
                <div className="mt-6 flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      name="clientName"
                      label={t('inspection.fields.clientName')}
                      register={register}
                      error={errors.clientName}
                      options={{ required: validationMessages.required }}
                      autoComplete="name"
                    />
                    <FormInput
                      name="mobileNumber"
                      label={t('inspection.fields.mobileNumber')}
                      register={register}
                      error={errors.mobileNumber}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      options={{
                        required: validationMessages.required,
                        validate: (value) => {
                          const digits = value.replace(/\D/g, '')
                          if (digits.length < 8) {
                            return validationMessages.invalidMobile
                          }
                          return true
                        },
                      }}
                    />
                    <FormInput
                      name="carType"
                      label={t('inspection.fields.carType')}
                      register={register}
                      error={errors.carType}
                      options={{ required: validationMessages.required }}
                      autoComplete="off"
                    />
                    <FormInput
                      name="model"
                      label={t('inspection.fields.model')}
                      register={register}
                      error={errors.model}
                      autoComplete="off"
                    />
                    <FormInput
                      name="color"
                      label={t('inspection.fields.color')}
                      register={register}
                      error={errors.color}
                    />
                    <FormInput
                      name="plateNumber"
                      label={t('inspection.fields.plateNumber')}
                      register={register}
                      error={errors.plateNumber}
                      options={{ required: validationMessages.required }}
                      autoComplete="off"
                    />
                    <FormInput
                      name="vin"
                      label={t('inspection.fields.vin')}
                      register={register}
                      error={errors.vin}
                      autoComplete="off"
                    />
                    <FormInput
                      name="odometer"
                      label={t('inspection.fields.odometer')}
                      register={register}
                      error={errors.odometer}
                      type="number"
                      inputMode="numeric"
                      options={{ valueAsNumber: true, min: { value: 0 } }}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormInput
                      name="date"
                      label={t('inspection.fields.date')}
                      register={register}
                      error={errors.date}
                      options={{ required: validationMessages.required }}
                      type="date"
                    />
                    <FormInput
                      name="crNumber"
                      label={t('inspection.fields.crNumber')}
                      register={register}
                      error={errors.crNumber}
                      options={{ required: validationMessages.required }}
                    />
                    <FormInput
                      name="vatNumber"
                      label={t('inspection.fields.vatNumber')}
                      register={register}
                      error={errors.vatNumber}
                      options={{ required: validationMessages.required }}
                    />
                  </div>
                </div>
              )}

              {section.id === 'checkupType' && (
                <div className="mt-6">
                  <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    {t('inspection.helperText.checkupType')}
                  </p>
                  <Controller
                    name="checkupType"
                    control={control}
                    rules={{ required: validationMessages.selectOne }}
                    render={({ field }) => (
                      <RadioGroup.Root
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid gap-4 sm:grid-cols-3"
                      >
                        {CHECKUP_TYPES.map((option) => (
                          <RadioGroup.Item
                            key={option.id}
                            value={option.id}
                            className={cn(
                              'group flex flex-col gap-2 rounded-2xl border border-slate-300 bg-white p-4 text-sm font-medium shadow-sm transition hover:border-primary dark:border-slate-800 dark:bg-[#121212] dark:text-slate-200',
                              field.value === option.id &&
                                'border-primary bg-primary/5 text-primary shadow-md shadow-primary/10'
                            )}
                          >
                            <span>{t(option.translationKey)}</span>
                            <span
                              className={cn(
                                'inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 transition group-hover:border-primary dark:border-slate-600',
                                field.value === option.id && 'border-primary bg-primary'
                              )}
                            >
                              <span
                                className={cn(
                                  'h-2.5 w-2.5 rounded-full bg-transparent transition',
                                  field.value === option.id && 'bg-white'
                                )}
                              />
                            </span>
                          </RadioGroup.Item>
                        ))}
                      </RadioGroup.Root>
                    )}
                  />
                  {errors.checkupType ? (
                    <p className="mt-3 text-sm font-medium text-red-500">
                      {errors.checkupType.message}
                    </p>
                  ) : null}
                </div>
              )}

              {checklistSections.has(section.id) && (
                <div className="mt-6">
                  <Controller
                    name={`checklist.${section.id}`}
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup
                        name={`checklist-${section.id}`}
                        value={field.value}
                        onValueChange={field.onChange}
                        items={checklist[section.id].map((item) => ({
                          id: item.id,
                          label: item[languageKey],
                        }))}
                        columns={section.id === 'electrical' ? 3 : 2}
                      />
                    )}
                  />
                </div>
              )}

              {section.id === 'notes' && (
                <div className="mt-6 flex flex-col gap-6">
                  <FormTextarea
                    name="notes"
                    label={t('inspection.fields.notes')}
                    register={register}
                    error={errors.notes}
                    placeholder={t('inspection.fields.notesPlaceholder')}
                  />

                  <div className="space-y-3 rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 dark:bg-[#121212] dark:text-slate-400">
                    {LEGAL_NOTICE_KEYS.map((key) => (
                      <p key={key}>{t(key)}</p>
                    ))}
                  </div>
                </div>
              )}
              </Card>
            ) : null
          )}

          <div className="flex flex-col gap-3 border-t border-slate-300 pt-6 dark:border-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl"
              >
                {t('inspection.actions.review')}
              </button>
              <button
                type="button"
                onClick={() => reset(defaultValues)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary/50 hover:text-primary dark:border-slate-700 dark:text-slate-400"
              >
                {t('inspection.actions.reset')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <SummaryModal
        open={isSummaryOpen}
        onOpenChange={(open) => {
          setIsSummaryOpen(open)
          if (!open) {
            setSubmitError(null)
            setSubmitSuccess(false)
          }
        }}
        data={submittedData}
        onConfirm={handleConfirm}
        onPrint={() => window.print()}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  )
}

export default InspectionForm

