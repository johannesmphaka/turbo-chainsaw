// Define the scenario distribution type
export interface ScenarioDistribution {
  type: string
  params: number[] // Simplified to just an array of two numbers
  periods: {
    [key: string]: {
      fval: number
      rwa_x: number
    }
  }
}

// Define the scenario type
export interface Scenario {
  id: number
  title: string
  description: string
  category: string
  distributions: {
    logn: ScenarioDistribution
    par: ScenarioDistribution
  }
}

// Function to generate a random number within a range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Function to calculate percentage difference
export function calculatePercentageDifference(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Function to generate scenarios
export function generateScenarios(): Scenario[] {
  const categories = ["Financial", "Operational", "Market", "Risk"]

  const scenarios: Scenario[] = []

  // Generate 48 scenarios
  for (let i = 1; i <= 48; i++) {
    const category = categories[i % categories.length]
    const seed = i * 100

    // Generate logn distribution with simplified params
    const lognParams = [Math.round(randomInRange(10, 50)), Math.round(randomInRange(40, 90))]

    // Base values for logn
    const lognBaseRwaX = randomInRange(0.5, 2.5) + (seed % 10) / 10
    const lognBaseFval = randomInRange(50, 200) + (seed % 50)

    // Generate par distribution with simplified params
    const parParams = [Math.round(randomInRange(5, 30)), Math.round(randomInRange(30, 80))]

    // Base values for par
    const parBaseRwaX = randomInRange(0.5, 2.5) + (seed % 10) / 10
    const parBaseFval = randomInRange(50, 200) + (seed % 50)

    // Create scenario with both distributions
    scenarios.push({
      id: i,
      title: `Scenario ${i}`,
      description: `Analysis for ${category.toLowerCase()} scenario ${i}`,
      category,
      distributions: {
        logn: {
          type: "logn",
          params: lognParams,
          periods: {
            "202412": {
              fval: lognBaseFval * (1 - randomInRange(-0.05, 0.1)),
              rwa_x: lognBaseRwaX * (1 - randomInRange(-0.05, 0.1)),
            },
            "202506": {
              fval: lognBaseFval * (1 + randomInRange(-0.05, 0.15)),
              rwa_x: lognBaseRwaX * (1 + randomInRange(-0.05, 0.15)),
            },
          },
        },
        par: {
          type: "par",
          params: parParams,
          periods: {
            "202412": {
              fval: parBaseFval * (1 - randomInRange(-0.05, 0.1)),
              rwa_x: parBaseRwaX * (1 - randomInRange(-0.05, 0.1)),
            },
            "202506": {
              fval: parBaseFval * (1 + randomInRange(-0.05, 0.15)),
              rwa_x: parBaseRwaX * (1 + randomInRange(-0.05, 0.15)),
            },
          },
        },
      },
    })
  }

  return scenarios
}

// Function to get a specific scenario by ID
export function getScenarioById(id: number): Scenario | undefined {
  const scenarios = generateScenarios()
  return scenarios.find((s) => s.id === id)
}
