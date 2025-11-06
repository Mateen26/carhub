import { HiArrowLongRight } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Card, { CardContent, CardHeader, CardSubtitle, CardTitle } from '../components/Card'

const stats = [
  { key: 'inspectionsToday', value: 12, trend: '+4.2%' },
  { key: 'pendingReports', value: 3, trend: '-1 pending' },
  { key: 'inProgress', value: 5, trend: '+2 new' },
]

const recentInspections = [
  {
    id: 1,
    clientName: 'Ahmed Al-Qahtani',
    carType: 'Toyota Camry',
    plate: 'أ ج ل - 4521',
    date: '2025-11-02',
    status: 'completed',
  },
  {
    id: 2,
    clientName: 'Fatimah Al-Harbi',
    carType: 'Nissan Patrol',
    plate: 'ح د ب - 1387',
    date: '2025-11-01',
    status: 'pending',
  },
  {
    id: 3,
    clientName: 'Mohammed Al-Saleh',
    carType: 'BMW X5',
    plate: 'KSA-8453',
    date: '2025-10-29',
    status: 'inProgress',
  },
  {
    id: 4,
    clientName: 'Laila Al-Mutairi',
    carType: 'Hyundai Sonata',
    plate: 'د ي م - 2274',
    date: '2025-10-27',
    status: 'completed',
  },
  {
    id: 5,
    clientName: 'Omar Al-Zahrani',
    carType: 'Ford Explorer',
    plate: 'JED-9921',
    date: '2025-10-25',
    status: 'completed',
  },
]

const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US'

  const formatter = new Intl.NumberFormat(locale)
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t('dashboard.title')}
          </h1>
          <p className="mt-1 text-base text-slate-600">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.key} className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wide text-slate-500">
                {t(`dashboard.cards.${item.key}`)}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold">
                  {formatter.format(item.value)}
                </span>
                <span className="text-xs font-medium text-emerald-500">
                  {item.trend}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('dashboard.table.title')}</CardTitle>
              <CardSubtitle>{t('dashboard.subtitle')}</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">{t('dashboard.table.columns.clientName')}</th>
                <th className="px-6 py-3">{t('dashboard.table.columns.carType')}</th>
                <th className="px-6 py-3">{t('dashboard.table.columns.plate')}</th>
                <th className="px-6 py-3">{t('dashboard.table.columns.date')}</th>
                <th className="px-6 py-3 text-right">{t('dashboard.table.columns.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentInspections.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-500" colSpan={5}>
                    {t('dashboard.table.empty')}
                  </td>
                </tr>
              ) : (
                recentInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">{inspection.clientName}</td>
                    <td className="px-6 py-4 text-slate-600">{inspection.carType}</td>
                    <td className="px-6 py-4">{inspection.plate}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {dateFormatter.format(new Date(inspection.date))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {t(`statuses.${inspection.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

