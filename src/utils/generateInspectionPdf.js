import { jsPDF } from 'jspdf'
import { CHECKUP_TYPES, CENTER_INFO } from '../config/constants'
import { checklist } from '../data/checklist'

import logoEnglishLight from '../assets/logo-english-light.png'
import logoArabicLight from '../assets/logo-arabic-light.png'

const logoAssets = { en: logoEnglishLight, ar: logoArabicLight }
const logoCache = { en: null, ar: null }

async function getLogoDataUrl(lang) {
  const key = lang === 'ar' ? 'ar' : 'en'
  if (logoCache[key]) return logoCache[key]
  const src = logoAssets[key]
  const res = await fetch(src)
  const blob = await res.blob()
  logoCache[key] = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
  return logoCache[key]
}

const fontCache = { normal: null, bold: null }

async function loadArabicFonts(doc) {
  if (fontCache.normal && fontCache.bold) return
  const base = typeof window !== 'undefined' && window.location ? window.location.origin : ''
  const toBase64 = async (url) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(blob)
    })
    return dataUrl.replace(/^data:[^;]+;base64,/, '')
  }
  fontCache.normal = fontCache.normal || await toBase64(`${base}/fonts/Amiri-Regular.ttf`)
  fontCache.bold = fontCache.bold || await toBase64(`${base}/fonts/Amiri-Bold.ttf`)
  doc.addFileToVFS('Amiri-Regular.ttf', fontCache.normal)
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
  doc.addFileToVFS('Amiri-Bold.ttf', fontCache.bold)
  doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold')
}

const MARGIN = 14
const PAGE_W = 210
const USABLE_W = PAGE_W - 2 * MARGIN
const COL_W = USABLE_W / 3
const LINE_H = 5
const GAP = 2

function colX(col) {
  return MARGIN + col * COL_W
}

function drawHr(doc, y, w = USABLE_W) {
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, MARGIN + w, y)
}

function sectionTitle(doc, title, y, font) {
  doc.setFontSize(12)
  doc.setFont(font || undefined, 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text(title, MARGIN, y)
  doc.setFont(font || undefined, 'normal')
  doc.setTextColor(0, 0, 0)
  return y + LINE_H + GAP
}

function fieldAt(doc, x, y, label, value, colWidth = COL_W - 4, font) {
  const v = value != null && String(value).trim() !== '' ? String(value) : '\u2014'
  doc.setFontSize(8)
  doc.setFont(font || undefined, 'bold')
  doc.text(label + ':', x, y)
  doc.setFont(font || undefined, 'normal')
  const lines = doc.splitTextToSize(v, colWidth)
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i], x, y + (i + 1) * LINE_H)
  }
  return y + LINE_H + lines.length * LINE_H + GAP
}

function fieldRow(doc, y, triple, font) {
  let maxY = y
  triple.forEach(([label, value], col) => {
    const x = colX(col) + 1
    const ny = fieldAt(doc, x, y, label, value, COL_W - 6, font)
    if (ny > maxY) maxY = ny
  })
  return maxY
}

/** Flatten [ { title, items } ] into [ { title, item } ] for grid, then chunk by 3 */
function flattenIssues(sectionSummaries) {
  const flat = []
  for (const sec of sectionSummaries) {
    for (const item of sec.items) {
      flat.push({ sectionTitle: sec.title, item })
    }
  }
  return flat
}

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

function addIssuesGrid(doc, sectionSummaries, y, t, colWidth = COL_W - 6, font) {
  const flat = flattenIssues(sectionSummaries)
  if (flat.length === 0) return y

  y = sectionTitle(doc, t('summary.selectedIssues'), y, font)
  drawHr(doc, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont(font || undefined, 'normal')
  const rows = chunk(flat, 3)
  const lineH = 5

  for (const row of rows) {
    let maxH = 0
    for (let c = 0; c < 3; c++) {
      const cell = row[c]
      if (!cell) continue
      const lines = doc.splitTextToSize('• ' + cell.item, colWidth)
      const h = lines.length * lineH + (lines.length ? GAP : 0)
      if (h > maxH) maxH = h
    }
    for (let c = 0; c < 3; c++) {
      const cell = row[c]
      if (!cell) continue
      const x = colX(c) + 2
      const lines = doc.splitTextToSize('• ' + cell.item, colWidth)
      for (let i = 0; i < lines.length; i++) doc.text(lines[i], x, y + i * lineH)
    }
    y += maxH
  }
  return y + 4
}

/**
 * @param {object} data - Summary modal payload
 * @param {{ t: (k: string) => string, languageKey: 'en'|'ar' }} i18n
 */
export async function generateSummaryPdf(data, { t, languageKey }) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageH = doc.internal.pageSize.height
  let y = 12
  const font = languageKey === 'ar' ? 'Amiri' : undefined
  if (font) await loadArabicFonts(doc)

  const logoDataUrl = await getLogoDataUrl(languageKey)
  doc.addImage(logoDataUrl, 'PNG', MARGIN, y, 42, 14)

  doc.setFontSize(14)
  doc.setFont(font || undefined, 'bold')
  doc.text(t('summary.title'), MARGIN + 48, y + 6)
  doc.setFontSize(9)
  doc.setFont(font || undefined, 'normal')
  const reportDate = data.date || new Date().toLocaleDateString(languageKey === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  doc.text(t('summary.reportDate') + ': ' + reportDate, PAGE_W - MARGIN, y + 6, { align: 'right' })
  y += 18

  drawHr(doc, y)
  y += 6

  y = sectionTitle(doc, t('summary.customerDetails'), y, font)
  drawHr(doc, y)
  y += 5

  const checkup = CHECKUP_TYPES.find((c) => c.id === data.checkupType)
  const checkupLabel = checkup ? t(checkup.translationKey) : (data.checkupType || '\u2014')

  const row1 = [
    [t('inspection.fields.clientName'), data.clientName],
    [t('inspection.fields.carType'), data.carType],
    [t('inspection.fields.crNumber'), data.crNumber],
  ]
  const row2 = [
    [t('inspection.fields.mobileNumber'), data.mobileNumber],
    [t('inspection.fields.model'), data.model],
    [t('inspection.fields.vatNumber'), data.vatNumber],
  ]
  const row3 = [
    [t('inspection.fields.plateNumber'), data.plateNumber],
    [t('inspection.fields.color'), data.color],
    [t('inspection.fields.odometer'), Number.isFinite(data.odometer) ? data.odometer.toLocaleString() : ''],
  ]
  const row4 = [
    [t('inspection.fields.vin'), data.vin],
    [t('inspection.fields.date'), data.date],
    [t('inspection.sections.checkupType'), checkupLabel],
  ]

  y = fieldRow(doc, y, row1, font)
  y = fieldRow(doc, y, row2, font)
  y = fieldRow(doc, y, row3, font)
  y = fieldRow(doc, y, row4, font)
  y += 4

  const sectionSummaries = Object.keys(checklist)
    .map((sectionId) => {
      const selectedIds = data.checklist?.[sectionId] || []
      const items = (checklist[sectionId] || [])
        .filter((item) => selectedIds.includes(item.id))
        .map((item) => item[languageKey])
      return { id: sectionId, title: t(`inspection.sections.${sectionId}`), items }
    })
    .filter((s) => s.items.length > 0)

  if (sectionSummaries.length > 0) {
    y = addIssuesGrid(doc, sectionSummaries, y, t, COL_W - 6, font)
  } else {
    y = sectionTitle(doc, t('summary.selectedIssues'), y, font)
    drawHr(doc, y)
    y += 6
    doc.setFontSize(9)
    doc.setFont(font || undefined, 'normal')
    doc.text(t('summary.noIssues'), MARGIN, y)
    y += 10
  }

  const notes = data.notes?.trim()
  if (notes) {
    y = sectionTitle(doc, t('summary.notes'), y, font)
    drawHr(doc, y)
    y += 6
    doc.setFont(font || undefined, 'normal')
    const lines = doc.splitTextToSize(notes, USABLE_W)
    for (let i = 0; i < lines.length; i++) doc.text(lines[i], MARGIN, y + i * LINE_H)
    y += lines.length * LINE_H + 6
  }

  const footerY = pageH - 28
  drawHr(doc, footerY, USABLE_W)
  y = footerY + 6

  const name = CENTER_INFO.name[languageKey] || CENTER_INFO.name.en
  const tagline = CENTER_INFO.tagline[languageKey] || CENTER_INFO.tagline.en
  doc.setFontSize(9)
  doc.setFont(font || undefined, 'bold')
  doc.text(name, PAGE_W / 2, y, { align: 'center' })
  doc.setFont(font || undefined, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(tagline, PAGE_W / 2, y + 5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 12

  doc.setFontSize(9)
  doc.setFont(font || undefined, 'normal')
  doc.text(t('summary.dateLabel') + ': _________________________    ' + t('summary.signatureLabel') + ': _________________________', MARGIN, y)

  doc.save(`inspection-summary-${Date.now()}.pdf`)
}

/**
 * @param {object} inspectionData - { inspection, vehicle, customer }
 * @param {{ t: (k: string) => string, languageKey: 'en'|'ar', locale: string }} i18n
 */
export async function generateDetailPdf(inspectionData, { t, languageKey, locale = 'en-US' }) {
  const { inspection, vehicle, customer } = inspectionData
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageH = doc.internal.pageSize.height
  let y = 12
  const font = languageKey === 'ar' ? 'Amiri' : undefined
  if (font) await loadArabicFonts(doc)

  const logoDataUrl = await getLogoDataUrl(languageKey)
  doc.addImage(logoDataUrl, 'PNG', MARGIN, y, 42, 14)

  doc.setFontSize(14)
  doc.setFont(font || undefined, 'bold')
  doc.text(t('summary.title'), MARGIN + 48, y + 6)
  doc.setFontSize(9)
  doc.setFont(font || undefined, 'normal')
  const reportDate = inspection.inspectionDate
    ? new Date(inspection.inspectionDate).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
    : new Date().toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
  doc.text(t('summary.reportDate') + ': ' + reportDate + '   ID: ' + (inspection.id || '').slice(0, 8), PAGE_W - MARGIN, y + 6, { align: 'right' })
  y += 18

  drawHr(doc, y)
  y += 6

  y = sectionTitle(doc, t('summary.customerDetails'), y, font)
  drawHr(doc, y)
  y += 5

  const formSectionMap = { gearbox: 'gearboxBrakes', chassis: 'chassis4x4' }
  const nameToItem = new Map()
  Object.entries(checklist).forEach(([sectionKey, items]) => {
    items.forEach((item) => nameToItem.set(item.en, { ...item, sectionKey }))
  })
  const sectionSummaries = Object.entries(inspection.findings || {})
    .map(([apiKey, names]) => {
      const formKey = formSectionMap[apiKey] || apiKey
      const items = (Array.isArray(names) ? names : [])
        .map((name) => {
          const it = nameToItem.get(name)
          return it ? it[languageKey] : name
        })
        .filter(Boolean)
      return { id: formKey, title: t(`inspection.sections.${formKey}`), items }
    })
    .filter((s) => s.items.length > 0)

  const checkup = CHECKUP_TYPES.find((c) => c.id === inspection.inspectionType)
  const checkupLabel = checkup ? t(checkup.translationKey) : inspection.inspectionType
  const odo = inspection.odometerReading != null ? inspection.odometerReading.toLocaleString(locale) : '\u2014'

  const r1 = [
    [t('inspection.fields.clientName'), customer.name],
    [t('inspection.fields.carType'), vehicle.carType],
    [t('inspection.fields.crNumber'), vehicle.crNumber],
  ]
  const r2 = [
    [t('inspection.fields.mobileNumber'), customer.mobileNumber],
    [t('inspection.fields.model'), vehicle.model],
    [t('inspection.fields.vatNumber'), vehicle.vatNumber],
  ]
  const r3 = [
    [t('inspection.fields.plateNumber'), vehicle.plateNumber],
    [t('inspection.fields.color'), vehicle.color],
    [t('inspection.fields.odometer'), odo],
  ]
  const r4 = [
    [t('inspection.fields.vin'), vehicle.vin],
    [t('inspection.sections.checkupType'), checkupLabel],
    [t('inspection.fields.date'), reportDate],
  ]

  y = fieldRow(doc, y, r1, font)
  y = fieldRow(doc, y, r2, font)
  y = fieldRow(doc, y, r3, font)
  y = fieldRow(doc, y, r4, font)
  y += 4

  if (sectionSummaries.length > 0) {
    y = addIssuesGrid(doc, sectionSummaries, y, t, COL_W - 6, font)
  } else {
    y = sectionTitle(doc, t('summary.selectedIssues'), y, font)
    drawHr(doc, y)
    y += 6
    doc.setFontSize(9)
    doc.setFont(font || undefined, 'normal')
    doc.text(t('summary.noIssues'), MARGIN, y)
    y += 10
  }

  const notes = inspection.generalNotes?.trim()
  if (notes) {
    y = sectionTitle(doc, t('summary.notes'), y, font)
    drawHr(doc, y)
    y += 6
    doc.setFont(font || undefined, 'normal')
    const lines = doc.splitTextToSize(notes, USABLE_W)
    for (let i = 0; i < lines.length; i++) doc.text(lines[i], MARGIN, y + i * LINE_H)
    y += lines.length * LINE_H + 6
  }

  const footerY = pageH - 28
  drawHr(doc, footerY, USABLE_W)
  y = footerY + 6

  const name = CENTER_INFO.name[languageKey] || CENTER_INFO.name.en
  const tagline = CENTER_INFO.tagline[languageKey] || CENTER_INFO.tagline.en
  doc.setFontSize(9)
  doc.setFont(font || undefined, 'bold')
  doc.text(name, PAGE_W / 2, y, { align: 'center' })
  doc.setFont(font || undefined, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(tagline, PAGE_W / 2, y + 5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 12

  doc.setFontSize(9)
  doc.setFont(font || undefined, 'normal')
  doc.text(t('summary.dateLabel') + ': _________________________    ' + t('summary.signatureLabel') + ': _________________________', MARGIN, y)

  doc.save(`inspection-${(inspection.id || '').slice(0, 8) || Date.now()}.pdf`)
}
