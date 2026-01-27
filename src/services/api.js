/**
 * API service for making HTTP requests to the CarHub backend
 * Note: In Vite, environment variables must be prefixed with VITE_ to be exposed.
 * If using REACT_APP_API_URL, you may need to configure Vite to expose it, or use VITE_API_URL instead.
 */

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || ''

/**
 * Creates a full API URL by appending the endpoint to the base URL
 * @param {string} endpoint - The API endpoint (e.g., 'inspection/create')
 * @returns {string} Full URL
 */
const getApiUrl = (endpoint) => {
  if (!API_BASE_URL) {
    throw new Error('REACT_APP_API_URL or VITE_API_URL environment variable is not set')
  }
  const baseUrl = API_BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${path}`
}

/**
 * Makes a POST request to the API
 * @param {string} endpoint - The API endpoint (e.g., 'inspection/create')
 * @param {object} data - The data to send in the request body
 * @returns {Promise<object>} The response data
 * @throws {Error} If the request fails
 */
export const postInspection = async (endpoint, data) => {
  try {
    const url = getApiUrl(endpoint)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && (error.message.includes('REACT_APP_API_URL') || error.message.includes('VITE_API_URL'))) {
      throw error
    }
    throw new Error(
      error.message || 'Failed to submit inspection. Please try again.'
    )
  }
}

/**
 * Makes a GET request to the API
 * @param {string} endpoint - The API endpoint (e.g., 'inspection')
 * @returns {Promise<object>} The response data
 * @throws {Error} If the request fails
 */
export const getInspections = async (endpoint = 'api/inspection') => {
  try {
    const url = getApiUrl(endpoint)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error && (error.message.includes('REACT_APP_API_URL') || error.message.includes('VITE_API_URL'))) {
      throw error
    }
    throw new Error(
      error.message || 'Failed to fetch inspections. Please try again.'
    )
  }
}

/**
 * Creates a new inspection record
 * @param {object} inspectionData - The inspection data in API format
 * @returns {Promise<object>} The created inspection record
 */
export const createInspection = async (inspectionData) => {
  return postInspection('api/inspection/create', inspectionData)
}

