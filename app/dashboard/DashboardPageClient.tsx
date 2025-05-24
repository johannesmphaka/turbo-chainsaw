"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/kokonutui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SelectionTable } from "@/components/dashboard/selection-table"
import { SelectedItemsTable } from "@/components/dashboard/selected-items-table"
import { LineChart, PieChart, ArrowRight, Save, Download, BarChart, X } from "lucide-react"
import Link from "next/link"
import { getMetricById } from "@/lib/metrics-data"
import { MetricCard } from "@/components/dashboard/metric-card"

type ItemType = "ILD" | "Scenario"

interface Item {
  id: number
  name: string
  type: ItemType
  category: string
  date: string
  status: "active" | "pending" | "archived"
}

interface SelectedMetric {
  ildId: number
  metricId: number
}

export default function DashboardPageClient() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetric[]>([])

  // Load selected metrics on mount
  useEffect(() => {
    const loadSelectedMetrics = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selectedMetricsMap")
        if (stored) {
          try {
            setSelectedMetrics(JSON.parse(stored))
          } catch (e) {
            console.error("Failed to parse selected metrics", e)
          }
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

  const handleSelectionChange = (items: Item[]) => {
    setSelectedItems(items)
  }

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id))
  }

  const handleRemoveMetric = (ildId: number) => {
    const updatedMetrics = selectedMetrics.filter((m) => m.ildId !== ildId)
    setSelectedMetrics(updatedMetrics)
    localStorage.setItem("selectedMetricsMap", JSON.stringify(updatedMetrics))
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Select up to 9 ILD items and 37 Scenario items for your analysis.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1">
              <Save className="h-4 w-4" />
              Save Selection
            </Button>
            <Button variant="outline" className="gap-1">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="selection" className="space-y-4">
          <TabsList>
            <TabsTrigger value="selection">Selection</TabsTrigger>
            <TabsTrigger value="selected">Selected Items</TabsTrigger>
            {selectedMetrics.length > 0 && (
              <TabsTrigger value="metrics" className="relative">
                Selected Models
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                  {selectedMetrics.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="selection" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Item Selection</CardTitle>
                <CardDescription>Select up to 9 ILD items and 37 Scenario items from the table below.</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectionTable onSelectionChange={handleSelectionChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selected" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Selected Items</CardTitle>
                <CardDescription>Your currently selected items for analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <SelectedItemsTable items={selectedItems} onRemoveItem={handleRemoveItem} />
              </CardContent>
            </Card>
          </TabsContent>

          {selectedMetrics.length > 0 && (
            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Selected Distribution Models</CardTitle>
                  <CardDescription>Your currently selected models from ILD plots.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-medium">Selected Models ({selectedMetrics.length}/9)</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("selectedMetricsMap")
                          setSelectedMetrics([])
                          window.dispatchEvent(new Event("storage"))
                        }}
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedMetrics.map((selected) => {
                        const metric = getMetricById(selected.ildId, selected.metricId)
                        if (!metric) return null

                        return (
                          <div key={`${selected.ildId}-${selected.metricId}`} className="relative">
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-7 w-7 bg-white dark:bg-gray-800"
                              onClick={() => handleRemoveMetric(selected.ildId)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                            <MetricCard metric={metric} ildId={selected.ildId} showPeriods={true} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                ILD Analysis
              </CardTitle>
              <CardDescription>View detailed analysis for your selected ILD items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {selectedItems.filter((item) => item.type === "ILD").length > 0
                  ? `You have selected ${selectedItems.filter((item) => item.type === "ILD").length} ILD items for analysis.`
                  : "No ILD items selected yet. Please select items from the table above."}
                {selectedMetrics.length > 0 &&
                  ` You've also selected distribution models for ${selectedMetrics.length} of 9 ILD plots.`}
              </p>
              <Link href="/ild">
                <Button className="w-full" disabled={selectedItems.filter((item) => item.type === "ILD").length === 0}>
                  View ILD Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Scenario Analysis
              </CardTitle>
              <CardDescription>View detailed analysis for your selected Scenario items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {selectedItems.filter((item) => item.type === "Scenario").length > 0
                  ? `You have selected ${selectedItems.filter((item) => item.type === "Scenario").length} Scenario items for analysis.`
                  : "No Scenario items selected yet. Please select items from the table above."}
              </p>
              <Link href="/scenarios">
                <Button
                  className="w-full"
                  disabled={selectedItems.filter((item) => item.type === "Scenario").length === 0}
                >
                  View Scenario Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
