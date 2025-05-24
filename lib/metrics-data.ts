// Define the metric type
export interface Metric {
  id: number
  distribution: string
  percentile: number
  rwa_x: number
  aic: number
  lambda: number
  periods: {
    [key: string]: {
      rwa_x: number
    }
  }
}

// Function to generate a random number within a range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Function to generate metrics for a specific ILD plot
export function generateMetrics(ildId: number): Metric[] {
  // Define distribution types and percentiles
  const distributions = ["lognm", "parm", "gamm", "invgm", "wblm"]
  const percentiles = [85, 90, 95, 100]

  const metrics: Metric[] = []
  let id = 1

  // Generate metrics for each distribution and percentile combination
  for (const dist of distributions) {
    for (const percentile of percentiles) {
      // Use ildId as a seed to ensure consistent values for the same ILD
      const seed = ildId * 100 + id

      // Base RWA_X value
      const baseRwaX = randomInRange(0.5, 2.5) + (seed % 10) / 10

      // Generate period data with some variation
      const period202412 = baseRwaX * (1 - randomInRange(-0.1, 0.15))
      const period202506 = baseRwaX * (1 + randomInRange(-0.05, 0.2))

      metrics.push({
        id: id++,
        distribution: dist,
        percentile: percentile,
        // Generate semi-random values that are consistent for the same ILD and metric
        rwa_x: baseRwaX,
        aic: randomInRange(100, 500) + (seed % 100),
        lambda: randomInRange(0.01, 0.2) + (seed % 5) / 100,
        periods: {
          "202412": { rwa_x: period202412 },
          "202506": { rwa_x: period202506 },
        },
      })
    }
  }

  // Add a few more metrics to reach 28 total
  const extraDists = ["expn", "norm", "gev", "gpd"]
  for (let i = 0; i < 8; i++) {
    const dist = extraDists[i % extraDists.length]
    const percentile = percentiles[i % percentiles.length]
    const seed = ildId * 100 + id

    // Base RWA_X value
    const baseRwaX = randomInRange(0.5, 2.5) + (seed % 10) / 10

    // Generate period data with some variation
    const period202412 = baseRwaX * (1 - randomInRange(-0.1, 0.15))
    const period202506 = baseRwaX * (1 + randomInRange(-0.05, 0.2))

    metrics.push({
      id: id++,
      distribution: dist,
      percentile: percentile,
      rwa_x: baseRwaX,
      aic: randomInRange(100, 500) + (seed % 100),
      lambda: randomInRange(0.01, 0.2) + (seed % 5) / 100,
      periods: {
        "202412": { rwa_x: period202412 },
        "202506": { rwa_x: period202506 },
      },
    })
  }

  return metrics
}

// Function to get a specific metric by ILD ID and metric ID
export function getMetricById(ildId: number, metricId: number): Metric | undefined {
  const metrics = generateMetrics(ildId)
  return metrics.find((m) => m.id === metricId)
}

// Calculate percentage difference between two values
export function calculatePercentageDifference(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}
