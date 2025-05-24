"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Scenario, ScenarioDistribution } from "@/lib/scenario-data"
import { calculatePercentageDifference } from "@/lib/scenario-data"
import { TrendingDown, TrendingUp, Check } from "lucide-react"

interface ScenarioCardProps {
  scenario: Scenario
  className?: string
}

export function ScenarioCard({ scenario, className }: ScenarioCardProps) {
  const [activeTab, setActiveTab] = useState<"logn" | "par">("logn")
  const [selectedDistribution, setSelectedDistribution] = useState<string | null>(null)

  // Define color based on category
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "financial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "operational":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "market":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "risk":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Handle tab change
  const handleTabChange = (tab: "logn" | "par") => {
    setActiveTab(tab)
  }

  // Handle distribution selection
  const handleSelect = (type: string) => {
    // If the same distribution is already selected, deselect it
    if (selectedDistribution === type) {
      setSelectedDistribution(null)
    } else {
      setSelectedDistribution(type)
    }
  }

  // Function to render period comparison
  const renderPeriodComparison = (distribution: ScenarioDistribution) => {
    const current = distribution.periods["202506"]
    const previous = distribution.periods["202412"]

    const fvalDiff = calculatePercentageDifference(current.fval, previous.fval)
    const rwaDiff = calculatePercentageDifference(current.rwa_x, previous.rwa_x)

    return (
      <div className="space-y-4">
        {/* Parameters row */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Params:</span>
          <span className="text-xs font-medium">[{distribution.params.join(", ")}]</span>
        </div>

        {/* Period header row */}
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">202506</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">202412</div>
        </div>

        {/* F-Value row */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">F-Val:</div>
          <div className="text-xs font-medium text-center">{current.fval.toFixed(2)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{previous.fval.toFixed(2)}</div>
        </div>

        {/* RWA_X row */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">RWA_X:</div>
          <div className="text-xs font-medium text-center">{current.rwa_x.toFixed(4)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{previous.rwa_x.toFixed(4)}</div>
        </div>

        {/* Percentage change row */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              "flex items-center text-xs justify-center",
              fvalDiff > 0
                ? "text-green-600 dark:text-green-400"
                : fvalDiff < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400",
            )}
          >
            F-Val: {fvalDiff > 0 ? "+" : ""}
            {fvalDiff.toFixed(2)}%
            {fvalDiff > 0 ? (
              <TrendingUp className="h-3 w-3 ml-1" />
            ) : fvalDiff < 0 ? (
              <TrendingDown className="h-3 w-3 ml-1" />
            ) : null}
          </div>

          <div
            className={cn(
              "flex items-center text-xs justify-center",
              rwaDiff > 0
                ? "text-green-600 dark:text-green-400"
                : rwaDiff < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400",
            )}
          >
            RWA_X: {rwaDiff > 0 ? "+" : ""}
            {rwaDiff.toFixed(2)}%
            {rwaDiff > 0 ? (
              <TrendingUp className="h-3 w-3 ml-1" />
            ) : rwaDiff < 0 ? (
              <TrendingDown className="h-3 w-3 ml-1" />
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // Check if this card has a selected distribution
  const hasSelection = selectedDistribution !== null

  return (
    <Card className={cn("h-full transition-all overflow-hidden", hasSelection && "ring-2 ring-blue-500", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <Badge className={cn("font-medium", getCategoryColor(scenario.category))}>{scenario.category}</Badge>
          <Badge variant="outline">#{scenario.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="w-full mb-3">
          <div className="flex w-full border-b mb-3">
            <button
              className={cn(
                "flex-1 text-center py-2 text-xs font-medium border-b-2",
                activeTab === "logn"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
              onClick={() => handleTabChange("logn")}
            >
              logn
            </button>
            <button
              className={cn(
                "flex-1 text-center py-2 text-xs font-medium border-b-2",
                activeTab === "par"
                  ? "border-green-500 text-green-600 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
              )}
              onClick={() => handleTabChange("par")}
            >
              par
            </button>
          </div>

          <div className="relative">
            {activeTab === "logn" && (
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={`/abstract-geometric-shapes.png?key=f5tm5&height=150&width=300&query=logn distribution plot`}
                    alt="logn distribution plot"
                    className="w-full h-full object-cover"
                  />
                </div>
                {renderPeriodComparison(scenario.distributions.logn)}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={selectedDistribution === "logn" ? "default" : "outline"}
                    className={cn("text-xs h-8", selectedDistribution === "logn" && "bg-blue-500 hover:bg-blue-600")}
                    onClick={() => handleSelect("logn")}
                  >
                    {selectedDistribution === "logn" ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Selected
                      </>
                    ) : (
                      "Select logn"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "par" && (
              <div className="space-y-3">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={`/abstract-geometric-shapes.png?key=g7tm5&height=150&width=300&query=par distribution plot`}
                    alt="par distribution plot"
                    className="w-full h-full object-cover"
                  />
                </div>
                {renderPeriodComparison(scenario.distributions.par)}

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant={selectedDistribution === "par" ? "default" : "outline"}
                    className={cn("text-xs h-8", selectedDistribution === "par" && "bg-green-500 hover:bg-green-600")}
                    onClick={() => handleSelect("par")}
                  >
                    {selectedDistribution === "par" ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Selected
                      </>
                    ) : (
                      "Select par"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
