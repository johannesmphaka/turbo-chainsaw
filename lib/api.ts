// API client for interacting with the FastAPI backend
const API_BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname.includes("vercel.app"))
    ? "http://localhost:8000/api" // Local development or preview
    : "/api" // Production with relative path

// Add these fallback data constants after the API_BASE_URL
const FALLBACK_BUSINESS_UNITS = ["CFs", "CIB", "PBB"]
const FALLBACK_PRODUCTS = {
  CFs: ["Business Enablers"],
  CIB: ["Business Enabler", "Global Markets", "Investment Banking", "TPS"],
  PBB: ["Transactional", "Lending", "VAF", "HL", "Card", "SBFC", "W&I", "Cash"],
}
const FALLBACK_BASEL_EVENT_TYPES = ["BDSF", "EDPM", "EF", "IF", "CPBP", "DTPA", "EPWS", "EDPM - FIFC", "EDPM - TAX"]

// Types
export interface ActualRun {
  business_unit: string
  product: string
  basel_event_type: string
  run_date: string
  description?: string
  id?: string
  created_at?: string
}

export interface ExperimentRun {
  business_unit: string
  product: string
  basel_event_type: string
  experiment_name: string
  description?: string
  id?: string
  created_at?: string
}

export interface ScenarioRun {
  name: string
  business_unit: string
  product: string
  status?: string
  id?: string
  created_at?: string
}

export interface ScenarioRunUpdate {
  status: string
}

export interface RunEntry {
  id?: string
  name: string
  businessUnit: string
  date: string
  product: string
  baselEventType: string
  values: {
    "1in2": string
    "1in5": string
    "1in10": string
    "1in20": string
  }
}

export interface BusinessUnit {
  name: string
  products: string[]
  baselEventTypes: string[]
}

// Add a function to check if we're in a preview environment
export function isPreviewEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") || window.location.hostname !== "localhost")
  )
}

// API functions
export async function fetchBusinessUnits(): Promise<string[]> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - returning mock business units")
      return FALLBACK_BUSINESS_UNITS
    }

    // Try to fetch from API
    const response = await fetch(`${API_BASE_URL}/business-units`)
    if (!response.ok) {
      throw new Error(`Failed to fetch business units: ${response.statusText}`)
    }
    const data = await response.json()
    return data.business_units
  } catch (error) {
    console.warn("Error fetching business units from API, using fallback data:", error)
    // Return fallback data when API is not available
    return FALLBACK_BUSINESS_UNITS
  }
}

export async function fetchProducts(businessUnit?: string): Promise<string[]> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - returning mock products")
      if (businessUnit && businessUnit in FALLBACK_PRODUCTS) {
        return FALLBACK_PRODUCTS[businessUnit as keyof typeof FALLBACK_PRODUCTS]
      }
      return Object.values(FALLBACK_PRODUCTS).flat()
    }

    const url = businessUnit
      ? `${API_BASE_URL}/products?business_unit=${encodeURIComponent(businessUnit)}`
      : `${API_BASE_URL}/products`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }
    const data = await response.json()
    return data.products
  } catch (error) {
    console.warn("Error fetching products from API, using fallback data:", error)
    // Return fallback data when API is not available
    if (businessUnit && businessUnit in FALLBACK_PRODUCTS) {
      return FALLBACK_PRODUCTS[businessUnit as keyof typeof FALLBACK_PRODUCTS]
    }
    // If no business unit or unknown business unit, return all products
    return Object.values(FALLBACK_PRODUCTS).flat()
  }
}

export async function fetchBaselEventTypes(): Promise<string[]> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - returning mock Basel event types")
      return FALLBACK_BASEL_EVENT_TYPES
    }

    const response = await fetch(`${API_BASE_URL}/basel-event-types`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Basel event types: ${response.statusText}`)
    }
    const data = await response.json()
    return data.basel_event_types
  } catch (error) {
    console.warn("Error fetching Basel event types from API, using fallback data:", error)
    // Return fallback data when API is not available
    return FALLBACK_BASEL_EVENT_TYPES
  }
}

// Actual Runs API
export async function createActualRun(run: ActualRun): Promise<{ success: boolean; id?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/actual-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(run),
    })

    if (!response.ok) {
      throw new Error(`Failed to create actual run: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating actual run:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function fetchActualRuns(): Promise<ActualRun[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/actual-runs`)
    if (!response.ok) {
      throw new Error(`Failed to fetch actual runs: ${response.statusText}`)
    }
    const data = await response.json()
    return data.runs || []
  } catch (error) {
    console.error("Error fetching actual runs:", error)
    return []
  }
}

// Experiment Runs API
export async function createExperimentRun(run: any): Promise<any> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - simulating successful API response")

      // Generate a unique ID
      const id = `preview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Return a simulated successful response with a generated ID
      return {
        success: true,
        id,
        message: "Created in preview mode (no backend connection)",
      }
    }

    // Try to connect to the real API
    const response = await fetch(`${API_BASE_URL}/experiment-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(run),
    })

    if (!response.ok) {
      // Check if the response is JSON or something else
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create experiment run: ${response.statusText}`)
      } else {
        throw new Error(`Failed to create experiment run: ${response.statusText}`)
      }
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating experiment run:", error)

    // If we're in a preview environment, return a successful response
    if (isPreviewEnvironment()) {
      // Generate a unique ID
      const id = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Return a simulated successful response with a generated ID
      return {
        success: true,
        id,
        message: "Created with fallback data (preview mode)",
      }
    }

    // Otherwise, return an error
    return {
      success: false,
      message: "Failed to create experiment run. Please check your connection to the backend server.",
    }
  }
}

export async function fetchExperimentRuns(): Promise<ExperimentRun[]> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - returning mock experiment runs")

      // Return mock data
      return [
        {
          id: "preview-1",
          business_unit: "CFs",
          product: "Business Enablers",
          basel_event_type: "DTPA",
          experiment_name: "Preview Experiment 1",
          created_at: new Date().toISOString(),
        },
        {
          id: "preview-2",
          business_unit: "CIB",
          product: "Global Markets",
          basel_event_type: "BDSF",
          experiment_name: "Preview Experiment 2",
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
      ]
    }

    const response = await fetch(`${API_BASE_URL}/experiment-runs`)
    if (!response.ok) {
      throw new Error(`Failed to fetch experiment runs: ${response.statusText}`)
    }
    const data = await response.json()
    return data.runs || []
  } catch (error) {
    console.warn("Error fetching experiment runs from API:", error)

    // If we're in a preview environment, return mock data
    if (isPreviewEnvironment()) {
      return [
        {
          id: "fallback-1",
          business_unit: "CFs",
          product: "Business Enablers",
          basel_event_type: "DTPA",
          experiment_name: "Fallback Experiment 1",
          created_at: new Date().toISOString(),
        },
      ]
    }

    // Return empty array when API is not available
    return []
  }
}

// Helper function to convert API experiment run to UI format
export function convertExperimentRunToUIFormat(run: ExperimentRun): RunEntry {
  return {
    id: run.id,
    name: run.experiment_name,
    businessUnit: run.business_unit,
    date: run.created_at
      ? new Date(run.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    product: run.product,
    baselEventType: run.basel_event_type,
    values: {
      "1in2": "0", // These values aren't in the API model, using placeholders
      "1in5": "0",
      "1in10": "0",
      "1in20": "0",
    },
  }
}

// Also update the deleteExperimentRun function to handle preview mode
export async function deleteExperimentRun(runId: string): Promise<any> {
  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.warn("Running in preview mode - simulating successful delete")

      // Return a simulated successful response
      return {
        success: true,
        message: `Experiment run ${runId} deleted successfully (preview mode)`,
      }
    }

    const response = await fetch(`${API_BASE_URL}/experiment-runs/${runId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete experiment run: ${response.statusText}`)
    }

    return { success: true, message: `Experiment run ${runId} deleted successfully` }
  } catch (error) {
    console.error("Error deleting experiment run:", error)

    // If we're in a preview environment, still return success
    if (isPreviewEnvironment()) {
      return {
        success: true,
        message: `Experiment run ${runId} deleted from UI (preview mode)`,
      }
    }

    return {
      success: false,
      message: `Failed to delete experiment run. Please check your connection to the backend server.`,
    }
  }
}

// Scenario Runs API
export async function createScenarioRun(
  run: ScenarioRun,
): Promise<{ success: boolean; id?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/scenario-runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(run),
    })

    if (!response.ok) {
      throw new Error(`Failed to create scenario run: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating scenario run:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function fetchScenarioRuns(): Promise<ScenarioRun[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/scenario-runs`)
    if (!response.ok) {
      throw new Error(`Failed to fetch scenario runs: ${response.statusText}`)
    }
    const data = await response.json()
    return data.runs || []
  } catch (error) {
    console.error("Error fetching scenario runs:", error)
    return []
  }
}

export async function updateScenarioRunStatus(
  runId: string,
  status: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/scenario-runs/${runId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update scenario run: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating scenario run:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function createBusinessUnit(businessUnit: BusinessUnit): Promise<any> {
  try {
    // Make an API call to create a business unit
    const response = await fetch(`${API_BASE_URL}/business-units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(businessUnit),
    })

    if (!response.ok) {
      throw new Error(`Failed to create business unit: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating business unit:", error)
    return {
      success: false,
      message: "Failed to create business unit. Please check your connection to the backend server.",
    }
  }
}
