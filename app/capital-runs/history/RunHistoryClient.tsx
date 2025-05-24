"use client"

import { useState } from "react"
import Layout from "@/components/kokonutui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Calculator, Download, FileSpreadsheet, Search, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Generate sample run data
const generateRunData = () => {
  const runTypes = ["Experiment", "Actual"]
  const businessUnits = ["CIB", "CFS", "PBB"]
  const frequencies = ["1 in 2 years", "1 in 5 years", "1 in 10 years", "1 in 20 years"]
  const statuses = ["Completed", "Processing", "Failed"]

  return Array.from({ length: 20 }, (_, i) => {
    const runType = runTypes[Math.floor(Math.random() * runTypes.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 60))

    return {
      id: i + 1,
      name: `${runType} Run ${i + 1}`,
      type: runType,
      businessUnit: businessUnits[Math.floor(Math.random() * businessUnits.length)],
      frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      date: date.toISOString().split("T")[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      capitalAmount: Math.floor(Math.random() * 10000000) + 1000000,
      change: Math.random() * 20 - 10, // -10% to +10%
    }
  })
}

export default function RunHistoryClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all")
  const [runs] = useState(generateRunData())

  // Filter runs based on search query and filters
  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.businessUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.frequency.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || run.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesBusinessUnit = businessUnitFilter === "all" || run.businessUnit === businessUnitFilter

    return matchesSearch && matchesType && matchesBusinessUnit
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Capital Run History</h1>
            <p className="text-muted-foreground">View and manage your historical capital runs.</p>
          </div>

          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export History
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search runs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Run Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="experiment">Experiment</SelectItem>
                <SelectItem value="actual">Actual</SelectItem>
              </SelectContent>
            </Select>

            <Select value={businessUnitFilter} onValueChange={setBusinessUnitFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Business Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="CIB">CIB</SelectItem>
                <SelectItem value="CFS">CFS</SelectItem>
                <SelectItem value="PBB">PBB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Run History</CardTitle>
                <CardDescription>
                  Showing {filteredRuns.length} of {runs.length} total runs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Business Unit</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Capital Amount</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRuns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No runs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRuns.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell className="font-medium">{run.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                {run.type === "Experiment" ? (
                                  <Calculator className="h-3 w-3" />
                                ) : (
                                  <FileSpreadsheet className="h-3 w-3" />
                                )}
                                {run.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{run.businessUnit}</TableCell>
                            <TableCell>{run.frequency}</TableCell>
                            <TableCell>{run.date}</TableCell>
                            <TableCell>${run.capitalAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              <div
                                className={cn(
                                  "flex items-center",
                                  run.change > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400",
                                )}
                              >
                                {run.change > 0 ? (
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 mr-1" />
                                )}
                                {Math.abs(run.change).toFixed(2)}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  run.status === "Completed" && "bg-green-500",
                                  run.status === "Processing" && "bg-blue-500",
                                  run.status === "Failed" && "bg-red-500",
                                )}
                              >
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Run Summary</CardTitle>
                <CardDescription>Overview of capital runs by business unit and type.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium">Summary Charts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2">
                      Charts showing capital run trends and distributions would appear here, with breakdowns by business
                      unit, frequency, and run type.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
