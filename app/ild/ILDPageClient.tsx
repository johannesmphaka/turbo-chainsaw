"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/kokonutui/layout"
import { PlotCard } from "@/components/ui/plot-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, TrendingDown, TrendingUp } from "lucide-react"
import { getMetricById, calculatePercentageDifference } from "@/lib/metrics-data"
import { cn } from "@/lib/utils"

interface SelectedMetric {
  ildId: number
  metricId: number
}

export default function ILDPageClient() {
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([])

  // Load selected metrics on mount
  useEffect(() => {
    const loadSelectedMetrics = () => {
      const stored = localStorage.getItem("selectedMetricsMap")
      if (stored) {
        try {
          setSelectedMetrics(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse selected metrics", e)
        }
      }
    }

    loadSelectedMetrics()

    // Add event listener for storage changes
    window.addEventListener("storage", loadSelectedMetrics)

    return () => {
      window.removeEventListener("storage", loadSelectedMetrics)
    }
  }, [])

  // Generate 9 ILD plots
  const plots = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `ILD Plot ${i + 1}`,
    description: `Analysis and visualization for ILD dataset ${i + 1}`,
  }))

  // Find selected metric for each ILD plot
  const getSelectedMetricForILD = (ildId: number) => {
    return selectedMetrics.find((m) => m.ildId === ildId)?.metricId
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ILD Analysis</h1>
          <p className="text-muted-foreground">
            Interactive visualization of ILD data. Click on a plot to see detailed analysis.
            {selectedMetrics.length > 0 && ` You've selected models for ${selectedMetrics.length} of 9 ILD plots.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plots.map((plot) => {
            const selectedMetricId = getSelectedMetricForILD(plot.id)
            const selectedMetric = selectedMetricId ? getMetricById(plot.id, selectedMetricId) : undefined

            // Calculate percentage difference if we have a selected metric
            let percentDiff = 0
            if (selectedMetric) {
              const rwa202412 = selectedMetric.periods["202412"].rwa_x
              const rwa202506 = selectedMetric.periods["202506"].rwa_x
              percentDiff = calculatePercentageDifference(rwa202506, rwa202412)
            }

            return (
              <Card key={plot.id} className={cn("overflow-hidden", selectedMetric ? "border-blue-500" : "")}>
                <div className="relative">
                  <PlotCard
                    id={plot.id}
                    title={plot.title}
                    description={plot.description}
                    linkTo={`/ild/${plot.id}`}
                    imageUrl={`/placeholder.svg?height=200&width=400&query=data visualization ${plot.id}`}
                    className="border-0 shadow-none"
                  />

                  {selectedMetric && (
                    <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                      <Check className="h-3 w-3 mr-1" /> {selectedMetric.distribution} {selectedMetric.percentile}%
                    </Badge>
                  )}
                </div>

                {selectedMetric && (
                  <CardContent className="p-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400">Current</p>
                        <p className="font-medium">
                          RWA_X: {selectedMetric.periods["202506"].rwa_x.toFixed(4)}
                          <span className="text-gray-500 dark:text-gray-400 ml-1">(202506)</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400">Previous</p>
                        <p className="font-medium">
                          RWA_X: {selectedMetric.periods["202412"].rwa_x.toFixed(4)}
                          <span className="text-gray-500 dark:text-gray-400 ml-1">(202412)</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 dark:text-gray-400">Change</p>
                        <div
                          className={cn(
                            "font-medium flex items-center",
                            percentDiff > 0
                              ? "text-green-600 dark:text-green-400"
                              : percentDiff < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-400",
                          )}
                        >
                          {percentDiff > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : percentDiff < 0 ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : null}
                          {Math.abs(percentDiff).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
