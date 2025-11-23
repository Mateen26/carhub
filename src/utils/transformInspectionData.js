import { checklist } from '../data/checklist'

/**
 * Maps form section names to API section names
 */
const SECTION_NAME_MAP = {
  gearboxBrakes: 'gearbox',
  chassis4x4: 'chassis',
}

/**
 * Creates a lookup map from checklist item ID to English name
 * @param {object} checklistData - The checklist data object
 * @returns {Map<string, string>} Map of ID to English name
 */
const createChecklistIdToNameMap = (checklistData) => {
  const map = new Map()
  Object.values(checklistData).forEach((sectionItems) => {
    sectionItems.forEach((item) => {
      map.set(item.id, item.en)
    })
  })
  return map
}

/**
 * Transforms form data to API payload format
 * @param {object} formData - The form data from react-hook-form
 * @returns {object} The transformed data in API format
 */
export const transformInspectionData = (formData) => {
  const checklistIdToNameMap = createChecklistIdToNameMap(checklist)

  // Transform findings: convert checklist IDs to English names and map section names
  const findings = {}
  
  Object.keys(formData.checklist || {}).forEach((sectionKey) => {
    const selectedIds = formData.checklist[sectionKey] || []
    
    // Skip empty sections
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      return
    }

    // Map section name (gearboxBrakes → gearbox, chassis4x4 → chassis)
    const apiSectionKey = SECTION_NAME_MAP[sectionKey] || sectionKey
    
    // Convert IDs to English names
    const findingsList = selectedIds
      .map((id) => checklistIdToNameMap.get(id))
      .filter((name) => name !== undefined) // Filter out any unmapped IDs
    
    if (findingsList.length > 0) {
      findings[apiSectionKey] = findingsList
    }
  })

  // Build the API payload structure
  return {
    customer: {
      name: formData.clientName || '',
      mobile: formData.mobileNumber || '',
    },
    vehicle: {
      carType: formData.carType || '',
      model: formData.model || '',
      color: formData.color || '',
      plateNumber: formData.plateNumber || '',
      vin: formData.vin || '',
      crNumber: formData.crNumber || '',
      vatNumber: formData.vatNumber || '',
    },
    inspection: {
      inspectionType: formData.checkupType || 'engine',
      odometerReading: typeof formData.odometer === 'number' 
        ? formData.odometer 
        : parseInt(formData.odometer, 10) || 0,
      inspectionDate: formData.date || '',
      findings: findings,
      generalNotes: formData.notes || '',
    },
  }
}

