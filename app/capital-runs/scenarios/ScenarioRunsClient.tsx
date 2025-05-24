"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/kokonutui/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileSpreadsheet,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  X,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Info,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Update the scenario run type to only have "running" or "completed" status
interface ScenarioRun {
  id: string
  name: string
  status: "running" | "completed"
  progress: number
  startTime: string
  endTime?: string
  scenarioType: string
  distribution: string
  businessUnit: string
  product: string
  baselEventType: string
  results?: {
    fval: number
    rwa_x: number
  }
}

export default function ScenarioRunsClient() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>("running")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [runName, setRunName] = useState<string>("")
  const [scenarioRuns, setScenarioRuns] = useState<ScenarioRun[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Update the sample runs to use only "running" or "completed" status
  useEffect(() => {
    const sampleRuns: ScenarioRun[] = [
      {
        id: "1",
        name: "Q2 2024 Financial Scenarios",
        status: "completed",
        progress: 100,
        startTime: "2024-05-15T09:30:00",
        endTime: "2024-05-15T10:45:00",
        scenarioType: "Financial",
        distribution: "logn",
        businessUnit: "CFs",
        product: "Business Enablers",
        baselEventType: "DTPA",
        results: {
          fval: 0.87,
          rwa_x: 0.0456,
        },
      },
      {
        id: "2",
        name: "Market Risk Analysis",
        status: "running",
        progress: 68,
        startTime: "2024-05-18T14:20:00",
        scenarioType: "Market",
        distribution: "par",
        businessUnit: "CIB",
        product: "Global Markets",
        baselEventType: "BDSF",
      },
      {
        id: "3",
        name: "Operational Risk Scenarios",
        status: "running",
        progress: 15,
        startTime: "2024-05-18T16:00:00",
        scenarioType: "Operational",
        distribution: "logn",
        businessUnit: "PBB",
        product: "Lending",
        baselEventType: "EDPM",
      },
      {
        id: "4",
        name: "Risk Exposure Analysis",
        status: "completed",
        progress: 100,
        startTime: "2024-05-17T11:15:00",
        endTime: "2024-05-17T11:38:00",
        scenarioType: "Risk",
        distribution: "par",
        businessUnit: "CIB",
        product: "Investment Banking",
        baselEventType: "IF",
        results: {
          fval: 0.76,
          rwa_x: 0.0512,
        },
      },
      {
        id: "5",
        name: "Q1 2024 Retrospective",
        status: "completed",
        progress: 100,
        startTime: "2024-05-16T08:45:00",
        endTime: "2024-05-16T09:30:00",
        scenarioType: "Financial",
        distribution: "logn",
        businessUnit: "CFs",
        product: "Business Enablers",
        baselEventType: "EPWS",
        results: {
          fval: 0.92,
          rwa_x: 0.0378,
        },
      },
    ]

    setScenarioRuns(sampleRuns)
  }, [])

  // Update the filter runs function to handle only running or completed status
  const filteredRuns = scenarioRuns.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.scenarioType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.businessUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.baselEventType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || run.status === statusFilter

    const matchesTab =
      (activeTab === "running" && run.status === "running") || (activeTab === "completed" && run.status === "completed")

    return matchesSearch && matchesStatus && matchesTab
  })

  // Handle scenario selection
  const handleScenarioSelection = (id: string) => {
    if (selectedScenarios.includes(id)) {
      setSelectedScenarios(selectedScenarios.filter((scenarioId) => scenarioId !== id))
    } else {
      setSelectedScenarios([...selectedScenarios, id])
    }
  }

  // Handle select all scenarios
  const handleSelectAll = () => {
    if (selectedScenarios.length === filteredRuns.length) {
      setSelectedScenarios([])
    } else {
      setSelectedScenarios(filteredRuns.map((run) => run.id))
    }
  }

  // Update the run action to create a new run with "running" status
  const handleRunAction = () => {
    if (runName.trim() === "") {
      toast({
        title: "Run name required",
        description: "Please enter a name for this scenario run",
        variant: "destructive",
      })
      return
    }

    // Create a new run with the selected scenarios
    const newRun: ScenarioRun = {
      id: Date.now().toString(),
      name: runName,
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
      scenarioType: "Combined",
      distribution: "multiple",
      businessUnit: "Multiple",
      product: "Multiple",
      baselEventType: "Multiple",
    }

    setScenarioRuns([newRun, ...scenarioRuns])
    setRunName("")
    setSelectedScenarios([])
    setShowRunDialog(false)

    toast({
      title: "Scenarios running",
      description: `${selectedScenarios.length} scenarios have been started`,
    })
  }

  // Simplify the refresh function to update only running status
  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate a refresh delay
    setTimeout(() => {
      // Update running runs
      const updatedRuns = scenarioRuns.map((run) => {
        if (run.status === "running") {
          const newProgress = Math.min(run.progress + Math.floor(Math.random() * 15), 100)

          if (newProgress === 100) {
            return {
              ...run,
              status: "completed",
              progress: 100,
              endTime: new Date().toISOString(),
              results: {
                fval: Number.parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)),
                rwa_x: Number.parseFloat((Math.random() * 0.1).toFixed(4)),
              },
            }
          }

          return {
            ...run,
            progress: newProgress,
          }
        }

        return run
      })

      setScenarioRuns(updatedRuns)
      setIsRefreshing(false)

      toast({
        title: "Refreshed",
        description: "Scenario run statuses have been updated",
      })
    }, 1000)
  }

  // Simplify the run control to only handle stop action
  // const handleRunControl = (id: string, action: "stop") => {
  //   const updatedRuns = scenarioRuns.map((run) => {
  //     if (run.id === id && run.status === "running") {
  //       return { ...run, status: "failed", endTime: new Date().toISOString() }
  //     }
  //     return run
  //   })

  //   setScenarioRuns(updatedRuns)

  //   toast({
  //     title: "Run stopped",
  //     description: "The scenario run has been stopped",
  //   })
  // }

  // Update the status badge function to handle only running or completed
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Completed
          </Badge>
        )
      case "running":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
            Running
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get scenario type icon
  const getScenarioTypeIcon = (type: string) => {
    switch (type) {
      case "Financial":
        return <BarChart3 className="h-4 w-4 text-blue-500" />
      case "Market":
        return <LineChart className="h-4 w-4 text-purple-500" />
      case "Operational":
        return <PieChart className="h-4 w-4 text-green-500" />
      case "Risk":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileSpreadsheet className="h-4 w-4 text-gray-500" />
    }
  }

  // Update the tabs to use "running" instead of "active"
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scenario Runs</h1>
            <p className="text-muted-foreground">Run and monitor captured scenarios from the scenario analysis.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-9 ${isRefreshing ? "opacity-50 pointer-events-none" : ""}`}
              onClick={handleRefresh}
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  disabled={selectedScenarios.length === 0}
                >
                  <Play className="h-4 w-4 mr-1.5" />
                  Run Selected ({selectedScenarios.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Run Selected Scenarios</DialogTitle>
                  <DialogDescription>
                    You are about to run {selectedScenarios.length} selected scenarios. This may take some time to
                    complete.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="run-name">Run Name</Label>
                    <Input
                      id="run-name"
                      placeholder="Enter a name for this run"
                      value={runName}
                      onChange={(e) => setRunName(e.target.value)}
                    />
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p>
                        Running multiple scenarios may take significant time and computational resources. You can stop
                        runs at any time.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRunDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRunAction}>Run Scenarios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search scenarios..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="running" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="running" className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Running
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="running" className="space-y-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Running Scenario Runs
                </CardTitle>
                <CardDescription>View and manage currently running scenario runs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={filteredRuns.length > 0 && selectedScenarios.length === filteredRuns.length}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Run Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Distribution</TableHead>
                        <TableHead>Business Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRuns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <FileSpreadsheet className="h-10 w-10 mb-2" />
                              <p>No running scenario runs found.</p>
                              <p className="text-sm">Select scenarios from the Scenarios page to run them.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRuns.map((run) => (
                          <TableRow key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                            <TableCell>
                              <Checkbox
                                checked={selectedScenarios.includes(run.id)}
                                onCheckedChange={() => handleScenarioSelection(run.id)}
                                aria-label={`Select ${run.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{run.name}</TableCell>
                            <TableCell>{getStatusBadge(run.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={run.progress} className="h-2 w-[100px]" />
                                <span className="text-xs text-gray-500">{run.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                {formatDate(run.startTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getScenarioTypeIcon(run.scenarioType)}
                                {run.scenarioType}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  run.distribution === "logn"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                                    : run.distribution === "par"
                                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800"
                                }
                              >
                                {run.distribution}
                              </Badge>
                            </TableCell>
                            <TableCell>{run.businessUnit}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Completed Scenario Runs
                </CardTitle>
                <CardDescription>View results from completed scenario runs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={filteredRuns.length > 0 && selectedScenarios.length === filteredRuns.length}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>Run Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Business Unit</TableHead>
                        <TableHead>F-Val</TableHead>
                        <TableHead>RWA_X</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRuns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <FileSpreadsheet className="h-10 w-10 mb-2" />
                              <p>No completed scenario runs found.</p>
                              <p className="text-sm">Completed runs will appear here.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRuns.map((run) => (
                          <TableRow key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                            <TableCell>
                              <Checkbox
                                checked={selectedScenarios.includes(run.id)}
                                onCheckedChange={() => handleScenarioSelection(run.id)}
                                aria-label={`Select ${run.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{run.name}</TableCell>
                            <TableCell>{getStatusBadge(run.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                {formatDate(run.startTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                {formatDate(run.endTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {getScenarioTypeIcon(run.scenarioType)}
                                {run.scenarioType}
                              </div>
                            </TableCell>
                            <TableCell>{run.businessUnit}</TableCell>
                            <TableCell>
                              {run.results ? <span className="font-mono">{run.results.fval.toFixed(2)}</span> : "—"}
                            </TableCell>
                            <TableCell>
                              {run.results ? <span className="font-mono">{run.results.rwa_x.toFixed(4)}</span> : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <FileSpreadsheet className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View detailed results</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
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
        </Tabs>
      </div>
    </Layout>
  )
}
