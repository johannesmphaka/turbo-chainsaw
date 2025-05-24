"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/kokonutui/layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Check, Filter, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MetricCard } from "@/components/dashboard/metric-card"
import { generateMetrics } from "@/lib/metrics-data"

interface SelectedMetric {
  ildId: number
  metricId: number
}

interface ILDDetailPageClientProps {
  params: {
    id: string
  }
}

export default function ILDDetailPageClient({ params }: ILDDetailPageClientProps) {
  const plotId = Number.parseInt(params.id)
  const { toast } = useToast()
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null)
  const [allSelectedMetrics, setAllSelectedMetrics] = useState<SelectedMetric[]>([])
  const [distributionFilter, setDistributionFilter] = useState<string[]>([])
  const [percentileFilter, setPercentileFilter] = useState<string[]>([])

  // Generate metrics for this ILD plot
  const metrics = generateMetrics(plotId)

  // Load selected metrics on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedMetricsMap")
    if (stored) {
      try {
        const metrics = JSON.parse(stored) as SelectedMetric[]
        setAllSelectedMetrics(metrics)

        // Find if there's a metric selected for this ILD
        const selectedForThisILD = metrics.find((m) => m.ildId === plotId)
        if (selectedForThisILD) {
          setSelectedMetricId(selectedForThisILD.metricId)
        }
      } catch (e) {
        console.error("Failed to parse selected metrics", e)
      }
    }
  }, [plotId])

  const selectMetric = (metricId: number) => {
    // If this metric is already selected, deselect it
    if (selectedMetricId === metricId) {
      setSelectedMetricId(null)
      return
    }

    // Otherwise, select this metric
    setSelectedMetricId(metricId)
  }

  const handleSaveSelection = () => {
    // Update the selected metrics map
    let updatedMetrics = [...allSelectedMetrics]

    // Remove any existing selection for this ILD
    updatedMetrics = updatedMetrics.filter((m) => m.ildId !== plotId)

    // Add the new selection if there is one
    if (selectedMetricId !== null) {
      updatedMetrics.push({
        ildId: plotId,
        metricId: selectedMetricId,
      })
    }

    // Save to localStorage
    localStorage.setItem("selectedMetricsMap", JSON.stringify(updatedMetrics))

    // Trigger a storage event for other components to pick up the change
    window.dispatchEvent(new Event("storage"))

    // Show toast
    toast({
      title: selectedMetricId !== null ? "Metric selected" : "Selection cleared",
      description:
        selectedMetricId !== null
          ? `Metric ${selectedMetricId} has been selected for ILD Plot ${plotId}.`
          : `Selection for ILD Plot ${plotId} has been cleared.`,
    })
  }

  // Get unique distribution types and percentiles for filtering
  const distributions = Array.from(new Set(metrics.map((m) => m.distribution)))
  const percentiles = Array.from(new Set(metrics.map((m) => m.percentile.toString())))

  // Filter metrics based on filters
  const filteredMetrics = metrics.filter(
    (metric) =>
      (distributionFilter.length === 0 || distributionFilter.includes(metric.distribution)) &&
      (percentileFilter.length === 0 || percentileFilter.includes(metric.percentile.toString())),
  )

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ILD Plot {plotId} - Detailed Analysis</h1>
            <p className="text-muted-foreground">
              Select one distribution model from this plot to include in your analysis.
              {selectedMetricId !== null && ` You've selected Metric ${selectedMetricId}.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/ild">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to ILD
              </Button>
            </Link>
            <Button size="sm" className="gap-1" onClick={handleSaveSelection}>
              <Save className="h-4 w-4" />
              Save Selection
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 flex-wrap">
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {selectedMetricId !== null ? "1 Model Selected" : "No Model Selected"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Distribution
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {distributions.map((dist) => (
                  <DropdownMenuCheckboxItem
                    key={dist}
                    checked={distributionFilter.includes(dist)}
                    onCheckedChange={(checked) => {
                      setDistributionFilter((prev) => (checked ? [...prev, dist] : prev.filter((d) => d !== dist)))
                    }}
                  >
                    {dist}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Percentile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {percentiles.map((percentile) => (
                  <DropdownMenuCheckboxItem
                    key={percentile}
                    checked={percentileFilter.includes(percentile)}
                    onCheckedChange={(checked) => {
                      setPercentileFilter((prev) =>
                        checked ? [...prev, percentile] : prev.filter((p) => p !== percentile),
                      )
                    }}
                  >
                    {percentile}%
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(distributionFilter.length > 0 || percentileFilter.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDistributionFilter([])
                  setPercentileFilter([])
                }}
                className="gap-1"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMetrics.map((metric) => (
            <div key={metric.id} className="relative group">
              <div
                className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  selectMetric(metric.id)
                }}
              >
                <Checkbox
                  checked={selectedMetricId === metric.id}
                  className="h-5 w-5 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                />
              </div>

              <MetricCard metric={metric} isSelected={selectedMetricId === metric.id} ildId={plotId} />

              {selectedMetricId === metric.id && (
                <Badge className="absolute bottom-2 left-2 bg-blue-500 text-white">
                  <Check className="h-3 w-3 mr-1" /> Selected
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
