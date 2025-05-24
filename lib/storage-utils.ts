// This file is no longer needed as we're using the Python backend for data persistence
// We'll keep it for reference but it's not being used anymore

export const STORAGE_KEYS = {
  BUSINESS_UNITS: "capital-runs:business-units",
  PRODUCTS: "capital-runs:products",
  BASEL_EVENT_TYPES: "capital-runs:basel-event-types",
  EXPERIMENT_RUNS: "capital-runs:experiment-runs",
  BUSINESS_UNIT_MAPPING: "capital-runs:business-unit-mapping",
}

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    }
    return defaultValue
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error)
    return defaultValue
  }
}

/**
 * Clear all storage keys related to capital runs
 */
export function clearAllStorage(): void {
  try {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
    }
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}
