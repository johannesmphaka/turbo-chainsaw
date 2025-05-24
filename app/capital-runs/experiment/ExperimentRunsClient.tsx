"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import type React from "react"

import { useState, useEffect } from "react"
import Layout from "@/components/kokonutui/layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  Upload,
  Plus,
  Save,
  Calculator,
  Download,
  Trash2,
  Building2,
  Info,
  AlertCircle,
  Loader2,
  Database,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  createBusinessUnit,
  createExperimentRun,
  deleteExperimentRun,
  type RunEntry,
  type BusinessUnit,
  fetchBusinessUnits,
  fetchProducts,
  fetchBaselEventTypes,
  fetchExperimentRuns,
  type ExperimentRun,
} from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"

// Update the business unit mapping to change "CFS" to "CFs"
const defaultBusinessUnitMapping = {
  CFs: {
    Product: ["Business Enablers"],
    "Basel Event Type": ["DTPA", "EPWS", "EDPM - FIFC", "CPBP", "IF", "EDPM - TAX", "EF"],
  },
  CIB: {
    Product: ["Business Enabler", "Global Markets", "Investment Banking", "TPS"],
    "Basel Event Type": ["BDSF", "IF", "CPBP", "EDPM", "EF"],
  },
  PBB: {
    Product: ["Transactional", "Lending", "VAF", "HL", "Card", "SBFC", "W&I", "Cash"],
    "Basel Event Type": ["BDSF", "EDPM", "EF", "IF", "CPBP"],
  },
}

// Function to convert ExperimentRun from API format to UI format
const convertExperimentRunToUIFormat = (run: ExperimentRun): RunEntry => ({
  id: run.id,
  name: run.experiment_name,
  businessUnit: run.business_unit,
  date: run.created_at ? new Date(run.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  product: run.product,
  baselEventType: run.basel_event_type,
  values: {
    "1in2": "0", // These values aren't in the API model, using placeholders
    "1in5": "0",
    "1in10": "0",
    "1in20": "0",
  },
})

export default function ExperimentRunsClient() {
  const { toast } = useToast()

  // Form state
  const [businessUnit, setBusinessUnit] = useState<string>("")
  const [product, setProduct] = useState<string>("")
  const [baselEventType, setBaselEventType] = useState<string>("")
  const [experimentName, setExperimentName] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  // Data for dropdowns
  const [businessUnits, setBusinessUnits] = useState<string[]>([])
  const [products, setProducts] = useState<string[]>([])
  const [baselEventTypes, setBaselEventTypes] = useState<string[]>([])

  // Existing runs
  const [experimentRuns, setExperimentRuns] = useState<ExperimentRun[]>([])

  // Form validation
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [newBusinessUnit, setNewBusinessUnit] = useState<string>("")
  const [showNewBusinessUnitDialog, setShowNewBusinessUnitDialog] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [runEntries, setRunEntries] = useState<RunEntry[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Form values
  const [runName, setRunName] = useState<string>("")
  const [value1in2, setValue1in2] = useState<string>("")
  const [value1in5, setValue1in5] = useState<string>("")
  const [value1in10, setValue1in10] = useState<string>("")
  const [value1in20, setValue1in20] = useState<string>("")

  // Add state variables for new product and Basel event type
  const [newProduct, setNewProduct] = useState<string>("")
  const [newBaselEventType, setNewBaselEventType] = useState<string>("")
  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [showNewBaselEventTypeDialog, setShowNewBaselEventTypeDialog] = useState(false)

  // Available products and basel event types based on selected business unit
  const [availableProducts, setAvailableProducts] = useState<string[]>([])
  const [availableBaselEventTypes, setAvailableBaselEventTypes] = useState<string[]>([])

  // Business unit mapping
  const [businessUnitMapping, setBusinessUnitMapping] = useState<any>(defaultBusinessUnitMapping)

  // Reset data dialog
  const [showResetDataDialog, setShowResetDataDialog] = useState(false)

  // Load data for dropdowns
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load business units and basel event types
        const [businessUnitsData, baselEventTypesData] = await Promise.all([
          fetchBusinessUnits(),
          fetchBaselEventTypes(),
        ])

        setBusinessUnits(businessUnitsData)
        setBaselEventTypes(baselEventTypesData)

        try {
          // Try to load experiment runs (this might fail if API is not available)
          const runs = await fetchExperimentRuns()
          setExperimentRuns(runs)

          // Convert the API format to UI format for the table
          const formattedRuns = runs.map((run) => convertExperimentRunToUIFormat(run))
          setRunEntries(formattedRuns)
        } catch (runError) {
          console.warn("Error loading experiment runs:", runError)
          // We can continue without experiment runs data
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Connection Warning",
          description: "Using locally stored data. Backend API connection not available.",
          variant: "default",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Update available products and basel event types when business unit changes
  useEffect(() => {
    if (businessUnit && businessUnitMapping[businessUnit]) {
      const mapping = businessUnitMapping[businessUnit]
      setAvailableProducts(mapping["Product"])
      setAvailableBaselEventTypes(mapping["Basel Event Type"])

      // Reset product and basel event type when business unit changes
      setProduct("")
      setBaselEventType("")
    } else {
      setAvailableProducts([])
      setAvailableBaselEventTypes([])
    }
  }, [businessUnit, businessUnitMapping])

  // Update products when business unit changes
  useEffect(() => {
    const loadProducts = async () => {
      if (businessUnit) {
        try {
          const productsData = await fetchProducts(businessUnit)
          setProducts(productsData)
          // Reset product selection when business unit changes
          setProduct("")
        } catch (error) {
          console.error("Error loading products:", error)
        }
      } else {
        setProducts([])
      }
    }

    loadProducts()
  }, [businessUnit])

  // Validate form
  useEffect(() => {
    setIsFormValid(!!businessUnit && !!product && !!baselEventType && !!experimentName)
  }, [businessUnit, product, baselEventType, experimentName])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create new run entry for UI with a temporary ID
      const tempId = Date.now().toString()
      const newEntry: RunEntry = {
        id: tempId,
        name: runName || experimentName,
        businessUnit: businessUnit,
        date: new Date().toISOString().split("T")[0],
        product: product,
        baselEventType: baselEventType,
        values: {
          "1in2": value1in2 || "0",
          "1in5": value1in5 || "0",
          "1in10": value1in10 || "0",
          "1in20": value1in20 || "0",
        },
      }

      // Try to save to backend
      const result = await createExperimentRun({
        business_unit: businessUnit,
        product,
        basel_event_type: baselEventType,
        experiment_name: experimentName || runName,
        description,
      })

      // If we got a real ID from the API, update our entry
      if (result.success && result.id) {
        newEntry.id = result.id

        // Add to local state
        setRunEntries([newEntry, ...runEntries])

        // Reset form
        setRunName("")
        setExperimentName("")
        setDescription("")
        setValue1in2("")
        setValue1in5("")
        setValue1in10("")
        setValue1in20("")
        setProduct("")
        setBaselEventType("")

        // Show appropriate toast message
        if (result.message && result.message.includes("preview mode")) {
          toast({
            title: "Demo Mode",
            description: "Using demo mode - changes won't be saved to a backend.",
            variant: "default",
          })
        } else {
          toast({
            title: "Experiment run created",
            description: `Created a new ${activeTab} run for ${businessUnit}`,
          })
        }
      } else {
        // Handle error case
        toast({
          title: "Error",
          description: result.message || "Failed to create experiment run",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating experiment run:", error)

      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle adding a new business unit
  const handleAddBusinessUnit = async () => {
    if (newBusinessUnit.trim()) {
      try {
        // Create new business unit in backend
        const newBU: BusinessUnit = {
          name: newBusinessUnit,
          products: [],
          baselEventTypes: [],
        }

        await createBusinessUnit(newBU)

        // Update local state
        setBusinessUnits([...businessUnits, newBusinessUnit])

        // Update business unit mapping
        const updatedMapping = { ...businessUnitMapping }
        updatedMapping[newBusinessUnit] = {
          Product: [],
          "Basel Event Type": [],
        }
        setBusinessUnitMapping(updatedMapping)

        setBusinessUnit(newBusinessUnit)
        setShowNewBusinessUnitDialog(false)

        toast({
          title: "Business unit added",
          description: `Added new business unit: ${newBusinessUnit}`,
        })
      } catch (error) {
        console.error("Error adding business unit:", error)
        toast({
          title: "Error",
          description: "Failed to add business unit. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Add handler functions for adding new product and Basel event type
  const handleAddProduct = () => {
    if (newProduct.trim() && businessUnit) {
      // Update the available products
      const updatedProducts = [...availableProducts, newProduct]
      setAvailableProducts(updatedProducts)

      // Update the business unit mapping
      if (businessUnitMapping[businessUnit]) {
        const updatedMapping = { ...businessUnitMapping }
        updatedMapping[businessUnit]["Product"] = updatedProducts
        setBusinessUnitMapping(updatedMapping)
      }

      // Set the product to the newly added one
      setProduct(newProduct)
      setShowNewProductDialog(false)
      setNewProduct("")

      toast({
        title: "Product added",
        description: `Added new product: ${newProduct} to ${businessUnit}`,
      })
    }
  }

  const handleAddBaselEventType = () => {
    if (newBaselEventType.trim() && businessUnit) {
      // Update the available Basel event types
      const updatedTypes = [...availableBaselEventTypes, newBaselEventType]
      setAvailableBaselEventTypes(updatedTypes)

      // Update the business unit mapping
      if (businessUnitMapping[businessUnit]) {
        const updatedMapping = { ...businessUnitMapping }
        updatedMapping[businessUnit]["Basel Event Type"] = updatedTypes
        setBusinessUnitMapping(updatedMapping)
      }

      // Set the Basel event type to the newly added one
      setBaselEventType(newBaselEventType)
      setShowNewBaselEventTypeDialog(false)
      setNewBaselEventType("")

      toast({
        title: "Basel Event Type added",
        description: `Added new Basel Event Type: ${newBaselEventType} to ${businessUnit}`,
      })
    }
  }

  // Handle deleting an entry
  const handleDeleteEntry = async (id: string) => {
    setIsDeleting(id)

    try {
      await deleteExperimentRun(id)
      setRunEntries(runEntries.filter((entry) => entry.id !== id))

      toast({
        title: "Entry deleted",
        description: "The run entry has been deleted",
      })
    } catch (error) {
      console.error("Error deleting experiment run:", error)
      toast({
        title: "Error",
        description: "Failed to delete experiment run. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Handle resetting all data
  const handleResetAllData = async () => {
    try {
      // Make an API call to reset all data
      const response = await fetch(`/api/reset-data`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to reset data")
      }

      // Reset state
      setRunEntries([])
      setBusinessUnitMapping(defaultBusinessUnitMapping)

      setShowResetDataDialog(false)

      toast({
        title: "Data Reset",
        description: "All data has been reset on the server.",
        variant: "default",
      })

      // Reload data
      const runs = await fetchExperimentRuns()
      const formattedRuns = runs.map((run) => convertExperimentRunToUIFormat(run))
      setRunEntries(formattedRuns)
    } catch (error) {
      console.error("Error resetting data:", error)
      toast({
        title: "Error",
        description: "Failed to reset data. Please check your connection to the backend server.",
        variant: "destructive",
      })
    }
  }

  // Get badge color based on business unit
  const getBusinessUnitColor = (unit: string) => {
    switch (unit) {
      case "CFs":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "CIB":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      case "PBB":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800"
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Experiment Capital Runs</h1>
            <p className="text-muted-foreground">
              Create experimental capital runs to test different scenarios and parameters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => setShowResetDataDialog(true)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all locally stored data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Server CSV Storage Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="manual" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="manual" className="flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <form onSubmit={handleSubmit}>
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    Manual Data Entry
                  </CardTitle>
                  <CardDescription>Enter capital run parameters manually for experimental analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="run-name" className="flex items-center gap-1.5">
                        Run Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="run-name"
                        placeholder="Enter a name for this run"
                        value={runName}
                        onChange={(e) => setRunName(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="business-unit" className="flex items-center gap-1.5">
                        Business Unit <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Select a business unit to see available products and event types</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Select
                          value={businessUnit}
                          onValueChange={setBusinessUnit}
                          disabled={isLoading || isSubmitting}
                          required
                        >
                          <SelectTrigger id="business-unit" className="flex-1">
                            <SelectValue placeholder="Select business unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Dialog open={showNewBusinessUnitDialog} onOpenChange={setShowNewBusinessUnitDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" type="button">
                              <Plus className="h-4 w-4 mr-1" />
                              New
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Business Unit</DialogTitle>
                              <DialogDescription>Create a new business unit for capital runs.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="new-business-unit">Business Unit Name</Label>
                                <Input
                                  id="new-business-unit"
                                  placeholder="Enter business unit name"
                                  value={newBusinessUnit}
                                  onChange={(e) => setNewBusinessUnit(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowNewBusinessUnitDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddBusinessUnit}>Add Business Unit</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {businessUnit && (
                      <>
                        {/* Update the product and basel event type sections to include the new dialog buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="product" className="flex items-center gap-1.5">
                              Product <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 mt-1.5">
                              <Select
                                value={product}
                                onValueChange={setProduct}
                                disabled={!businessUnit || isLoading || isSubmitting}
                                required
                                className="flex-1"
                              >
                                <SelectTrigger id="product">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((prod) => (
                                    <SelectItem key={prod} value={prod}>
                                      {prod}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" type="button">
                                    <Plus className="h-4 w-4 mr-1" />
                                    New
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Product</DialogTitle>
                                    <DialogDescription>Create a new product for {businessUnit}.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="new-product">Product Name</Label>
                                      <Input
                                        id="new-product"
                                        placeholder="Enter product name"
                                        value={newProduct}
                                        onChange={(e) => setNewProduct(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewProductDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleAddProduct}>Add Product</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="basel-event-type" className="flex items-center gap-1.5">
                              Basel Event Type <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2 mt-1.5">
                              <Select
                                value={baselEventType}
                                onValueChange={setBaselEventType}
                                disabled={isLoading || isSubmitting}
                                required
                                className="flex-1"
                              >
                                <SelectTrigger id="basel-event-type">
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {baselEventTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Dialog open={showNewBaselEventTypeDialog} onOpenChange={setShowNewBaselEventTypeDialog}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" type="button">
                                    <Plus className="h-4 w-4 mr-1" />
                                    New
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add New Basel Event Type</DialogTitle>
                                    <DialogDescription>
                                      Create a new Basel event type for {businessUnit}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="new-basel-event-type">Basel Event Type</Label>
                                      <Input
                                        id="new-basel-event-type"
                                        placeholder="Enter Basel event type"
                                        value={newBaselEventType}
                                        onChange={(e) => setNewBaselEventType(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewBaselEventTypeDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleAddBaselEventType}>Add Basel Event Type</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3 flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium">Available options for {businessUnit}</p>
                            <p className="mt-1">Products: {availableProducts.join(", ")}</p>
                            <p className="mt-0.5">Basel Event Types: {availableBaselEventTypes.join(", ")}</p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="experiment-name">Experiment Name *</Label>
                      <Input
                        id="experiment-name"
                        value={experimentName}
                        onChange={(e) => setExperimentName(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Enter experiment name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Enter description (optional)"
                        rows={3}
                      />
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        Frequency Values <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1.5">
                        <div>
                          <Label htmlFor="1in2" className="text-sm text-muted-foreground">
                            1 in 2 years
                          </Label>
                          <Input
                            id="1in2"
                            placeholder="Enter value"
                            value={value1in2}
                            onChange={(e) => setValue1in2(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="1in5" className="text-sm text-muted-foreground">
                            1 in 5 years
                          </Label>
                          <Input
                            id="1in5"
                            placeholder="Enter value"
                            value={value1in5}
                            onChange={(e) => setValue1in5(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="1in10" className="text-sm text-muted-foreground">
                            1 in 10 years
                          </Label>
                          <Input
                            id="1in10"
                            placeholder="Enter value"
                            value={value1in10}
                            onChange={(e) => setValue1in10(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="1in20" className="text-sm text-muted-foreground">
                            1 in 20 years
                          </Label>
                          <Input
                            id="1in20"
                            placeholder="Enter value"
                            value={value1in20}
                            onChange={(e) => setValue1in20(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    disabled={!businessUnit || !product || !baselEventType || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Experiment Run
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Table of saved entries */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Saved Experiment Runs
                </CardTitle>
                <CardDescription>View and manage your saved experiment runs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                      <TableRow>
                        <TableHead>Run Name</TableHead>
                        <TableHead>Business Unit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Basel Event Type</TableHead>
                        <TableHead>1 in 2 years</TableHead>
                        <TableHead>1 in 5 years</TableHead>
                        <TableHead>1 in 10 years</TableHead>
                        <TableHead>1 in 20 years</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <Loader2 className="h-10 w-10 mb-2 animate-spin" />
                              <p>Loading experiment runs...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : runEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <FileSpreadsheet className="h-10 w-10 mb-2" />
                              <p>No experiment runs saved yet.</p>
                              <p className="text-sm">Create one using the form above.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        runEntries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getBusinessUnitColor(entry.businessUnit)}>
                                {entry.businessUnit}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.product}</TableCell>
                            <TableCell>{entry.baselEventType}</TableCell>
                            <TableCell>{entry.values["1in2"]}</TableCell>
                            <TableCell>{entry.values["1in5"]}</TableCell>
                            <TableCell>{entry.values["1in10"]}</TableCell>
                            <TableCell>{entry.values["1in20"]}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Download run data</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => handleDeleteEntry(entry.id!)}
                                        disabled={isDeleting === entry.id}
                                      >
                                        {isDeleting === entry.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete run</p>
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

          <TabsContent value="csv" className="space-y-4">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <form onSubmit={handleSubmit}>
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    CSV Upload
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file with capital run parameters for experimental analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="run-name-csv" className="flex items-center gap-1.5">
                        Run Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="run-name-csv"
                        placeholder="Enter a name for this run"
                        value={runName}
                        onChange={(e) => setRunName(e.target.value)}
                        required
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="business-unit-csv" className="flex items-center gap-1.5">
                        Business Unit <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Select a business unit to see available products and event types</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        <Select
                          value={businessUnit}
                          onValueChange={setBusinessUnit}
                          disabled={isLoading || isSubmitting}
                          required
                        >
                          <SelectTrigger id="business-unit-csv" className="flex-1">
                            <SelectValue placeholder="Select business unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessUnits.map((unit) => (
                              <SelectItem key={unit} value={unit} className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Dialog open={showNewBusinessUnitDialog} onOpenChange={setShowNewBusinessUnitDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" type="button">
                              <Plus className="h-4 w-4 mr-1" />
                              New
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Business Unit</DialogTitle>
                              <DialogDescription>Create a new business unit for capital runs.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="new-business-unit-csv">Business Unit Name</Label>
                                <Input
                                  id="new-business-unit-csv"
                                  placeholder="Enter business unit name"
                                  value={newBusinessUnit}
                                  onChange={(e) => setNewBusinessUnit(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowNewBusinessUnitDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddBusinessUnit}>Add Business Unit</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {businessUnit && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium">Available options for {businessUnit}</p>
                          <p className="mt-1">Products: {availableProducts.join(", ")}</p>
                          <p className="mt-0.5">Basel Event Types: {availableBaselEventTypes.join(", ")}</p>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Your CSV file should include the following columns:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
                        <li>1in2 (1 in 2 years value)</li>
                        <li>1in5 (1 in 5 years value)</li>
                        <li>1in10 (1 in 10 years value)</li>
                        <li>1in20 (1 in 20 years value)</li>
                        <li>product (must match one of the available products for the selected business unit)</li>
                        <li>
                          basel_event_type (must match one of the available event types for the selected business unit)
                        </li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Download CSV Template
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="csv-file" className="flex items-center gap-1.5">
                        Upload CSV File <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center mt-1.5 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <Input id="csv-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                        <Label htmlFor="csv-file" className="cursor-pointer flex flex-col items-center justify-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm font-medium">
                            {csvFile ? csvFile.name : "Click to upload or drag and drop"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            CSV files only (max 10MB)
                          </span>
                        </Label>
                      </div>
                    </div>

                    {csvFile && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md p-3">
                        <p className="text-sm flex items-center">
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-medium text-green-700 dark:text-green-300">{csvFile.name}</span>
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            ({Math.round(csvFile.size / 1024)} KB)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    disabled={!businessUnit || !csvFile}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload and Create Run
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Table of saved entries */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Saved Experiment Runs
                </CardTitle>
                <CardDescription>View and manage your saved experiment runs.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
                      <TableRow>
                        <TableHead>Run Name</TableHead>
                        <TableHead>Business Unit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Basel Event Type</TableHead>
                        <TableHead>1 in 2 years</TableHead>
                        <TableHead>1 in 5 years</TableHead>
                        <TableHead>1 in 10 years</TableHead>
                        <TableHead>1 in 20 years</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <FileSpreadsheet className="h-10 w-10 mb-2" />
                              <p>No experiment runs saved yet.</p>
                              <p className="text-sm">Create one using the form above.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        runEntries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                            <TableCell className="font-medium">{entry.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getBusinessUnitColor(entry.businessUnit)}>
                                {entry.businessUnit}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.date}</TableCell>
                            <TableCell>{entry.product}</TableCell>
                            <TableCell>{entry.baselEventType}</TableCell>
                            <TableCell>{entry.values["1in2"]}</TableCell>
                            <TableCell>{entry.values["1in5"]}</TableCell>
                            <TableCell>{entry.values["1in10"]}</TableCell>
                            <TableCell>{entry.values["1in20"]}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Download run data</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => handleDeleteEntry(entry.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete run</p>
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

      {/* Reset Data Dialog */}
      <Dialog open={showResetDataDialog} onOpenChange={setShowResetDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
            <DialogDescription>
              This will clear all locally stored data including experiment runs, business units, and settings. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p>All your saved experiment runs and custom settings will be permanently deleted.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDataDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetAllData}>
              Reset All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
