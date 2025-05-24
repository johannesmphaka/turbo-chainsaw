import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Metric } from "@/lib/metrics-data"
import { TrendingDown, TrendingUp } from "lucide-react"
import { calculatePercentageDifference } from "@/lib/metrics-data"

interface MetricCardProps {
  metric: Metric
  isSelected?: boolean
  ildId: number
  showPeriods?: boolean
}

export function MetricCard({ metric, isSelected, ildId, showPeriods = false }: MetricCardProps) {
  // Define color based on distribution type
  const getDistributionColor = (dist: string) => {
    switch (dist.toLowerCase()) {
      case "lognm":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "parm":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "gamm":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "invgm":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "wblm":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  // Calculate percentage difference between periods
  const percentDiff = calculatePercentageDifference(metric.periods["202506"].rwa_x, metric.periods["202412"].rwa_x)

  return (
    <Card
      className={cn(
        "h-full transition-all hover:shadow-md overflow-hidden",
        isSelected && "ring-2 ring-blue-500 dark:ring-blue-400",
      )}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <Badge className={cn("font-medium", getDistributionColor(metric.distribution))}>{metric.distribution}</Badge>
          <Badge variant="outline">{metric.percentile}%</Badge>
        </div>
        <CardTitle className="text-sm font-medium mt-2">
          {metric.distribution} {metric.percentile}%
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden mb-3">
          <img
            src={`/abstract-geometric-shapes.png?height=150&width=300&query=${metric.distribution} ${metric.percentile} distribution plot`}
            alt={`${metric.distribution} ${metric.percentile}% plot`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">RWA_X:</span>
            <span className="font-medium">{metric.rwa_x.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">AIC:</span>
            <span className="font-medium">{metric.aic.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Lambda:</span>
            <span className="font-medium">{metric.lambda.toFixed(4)}</span>
          </div>

          {showPeriods && (
            <>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">202506:</span>
                  <span className="font-medium">{metric.periods["202506"].rwa_x.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">202412:</span>
                  <span className="font-medium">{metric.periods["202412"].rwa_x.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Change:</span>
                <span
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
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t">
        <div className="w-full text-xs text-gray-500 dark:text-gray-400">
          ILD Plot {ildId} - Model {metric.id}
        </div>
      </CardFooter>
    </Card>
  )
}
