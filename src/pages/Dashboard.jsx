import { useEffect, useMemo, useState } from 'react'
import { HiArrowLongRight, HiOutlineCalendar, HiOutlinePhone, HiOutlineMagnifyingGlass, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Card from '../components/Card'
import InspectionDetailModal from '../components/InspectionDetailModal'
import { CHECKUP_TYPES } from '../config/constants'
import { getInspections } from '../services/api'

const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US'
  const [inspections, setInspections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getInspections()
        if (response.success && response.data) {
          // Sort by date (newest first)
          const sorted = [...response.data].sort((a, b) => {
            const dateA = new Date(a.inspection.createdAt)
            const dateB = new Date(b.inspection.createdAt)
            return dateB - dateA
          })
          setInspections(sorted)
        } else {
          setError('Failed to load inspections')
        }
      } catch (err) {
        setError(err.message || 'Failed to load inspections')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInspections()
  }, [])

  // Filter inspections based on search query
  const filteredInspections = useMemo(() => {
    if (!searchQuery.trim()) return inspections

    const query = searchQuery.toLowerCase().trim()
    return inspections.filter((item) => {
      const { inspection, vehicle, customer } = item
      
      // Search in customer name
      if (customer.name?.toLowerCase().includes(query)) return true
      
      // Search in mobile number
      if (customer.mobileNumber?.toLowerCase().includes(query)) return true
      
      // Search in car type
      if (vehicle.carType?.toLowerCase().includes(query)) return true
      
      // Search in model
      if (vehicle.model?.toLowerCase().includes(query)) return true
      
      // Search in plate number
      if (vehicle.plateNumber?.toLowerCase().includes(query)) return true
      
      // Search in VIN
      if (vehicle.vin?.toLowerCase().includes(query)) return true
      
      // Search in color
      if (vehicle.color?.toLowerCase().includes(query)) return true
      
      // Search in notes
      if (inspection.generalNotes?.toLowerCase().includes(query)) return true
      
      return false
    })
  }, [inspections, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInspections = filteredInspections.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getCheckupTypeLabel = (type) => {
    const checkupType = CHECKUP_TYPES.find((ct) => ct.id === type)
    return checkupType ? t(checkupType.translationKey) : type
  }

  const getTotalFindingsCount = (findings) => {
    if (!findings || typeof findings !== 'object') return 0
    return Object.values(findings).reduce((total, items) => {
      return total + (Array.isArray(items) ? items.length : 0)
    }, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inspection')}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl"
        >
          {t('app.actions.newInspection')}
          <HiArrowLongRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-8 w-8 animate-spin text-primary"
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading inspections...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Error loading inspections</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        </Card>
      ) : inspections.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No inspections found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started by creating your first inspection report.
            </p>
            <button
              type="button"
              onClick={() => navigate('/inspection')}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl"
            >
              {t('app.actions.newInspection')}
              <HiArrowLongRight className="h-5 w-5" />
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, plate number, car type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-700 shadow-sm transition placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-[#121212] dark:placeholder-slate-500 dark:text-slate-200 dark:focus:ring-primary/40"
            />
          </div>

          {/* Results Count */}
          {searchQuery && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Found {filteredInspections.length} inspection{filteredInspections.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Inspections Grid */}
          {filteredInspections.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <HiOutlineMagnifyingGlass className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No inspections found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {searchQuery
                    ? 'Try adjusting your search terms.'
                    : 'Get started by creating your first inspection report.'}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => navigate('/inspection')}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-xl"
                  >
                    {t('app.actions.newInspection')}
                    <HiArrowLongRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedInspections.map((item) => {
            const { inspection, vehicle, customer } = item
            const findingsCount = getTotalFindingsCount(inspection.findings)
            const inspectionDate = new Date(inspection.inspectionDate)
            const createdAt = new Date(inspection.createdAt)

            return (
              <Card key={inspection.id} className="flex flex-col gap-4 p-5 transition hover:shadow-lg">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate dark:text-white">
                      {customer.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <HiOutlinePhone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{customer.mobileNumber}</span>
                    </p>
                  </div>
                  <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1">
                    <span className="text-xs font-semibold text-primary">
                      {getCheckupTypeLabel(inspection.inspectionType)}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-[#121212]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('inspection.fields.carType')}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {vehicle.carType} {vehicle.model && vehicle.model}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t('inspection.fields.plateNumber')}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{vehicle.plateNumber}</span>
                  </div>
                  {vehicle.color && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {t('inspection.fields.color')}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 capitalize dark:text-slate-200">
                        {vehicle.color}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inspection Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <HiOutlineCalendar className="h-4 w-4" />
                      {t('inspection.fields.date')}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {dateFormatter.format(inspectionDate)}
                    </span>
                  </div>
                  {inspection.odometerReading && (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{t('inspection.fields.odometer')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {inspection.odometerReading.toLocaleString(locale)}
                      </span>
                    </div>
                  )}
                  {findingsCount > 0 && (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Issues Found</span>
                      <span className="font-semibold text-red-600 dark:text-red-500">{findingsCount}</span>
                    </div>
                  )}
                </div>

                {/* Notes Preview */}
                {inspection.generalNotes && (
                  <div className="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-800 dark:bg-[#121212]">
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {inspection.generalNotes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-300 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    {timeFormatter.format(createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInspection(item)
                      setIsDetailModalOpen(true)
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary/80"
                  >
                    View Details →
                  </button>
                </div>
              </Card>
            )
          })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-300 pt-6 dark:border-slate-800">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredInspections.length)} of {filteredInspections.length} inspections
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300"
                    >
                      <HiChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                                currentPage === page
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-slate-300 text-slate-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 text-slate-400 dark:text-slate-500">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300"
                    >
                      Next
                      <HiChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <InspectionDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        inspectionData={selectedInspection}
      />
    </div>
  )
}

export default Dashboard

