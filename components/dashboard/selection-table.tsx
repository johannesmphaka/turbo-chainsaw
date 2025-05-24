"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, PieChart, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ItemType = "ILD" | "Scenario"

interface Item {
  id: number
  name: string
  type: ItemType
  category: string
  date: string
  status: "active" | "pending" | "archived"
}

// Generate sample data
const generateItems = (): Item[] => {
  const items: Item[] = []

  // Generate ILD items
  for (let i = 1; i <= 20; i++) {
    items.push({
      id: i,
      name: `ILD Plot ${i}`,
      type: "ILD",
      category: i % 4 === 0 ? "Financial" : i % 4 === 1 ? "Operational" : i % 4 === 2 ? "Market" : "Risk",
      date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      status: i % 5 === 0 ? "archived" : i % 3 === 0 ? "pending" : "active",
    })
  }

  // Generate Scenario items
  for (let i = 1; i <= 50; i++) {
    items.push({
      id: i + 100,
      name: `Scenario ${i}`,
      type: "Scenario",
      category: i % 4 === 0 ? "Financial" : i % 4 === 1 ? "Operational" : i % 4 === 2 ? "Market" : "Risk",
      date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      status: i % 5 === 0 ? "archived" : i % 3 === 0 ? "pending" : "active",
    })
  }

  return items
}

interface SelectionTableProps {
  onSelectionChange?: (selected: Item[]) => void
}

export function SelectionTable({ onSelectionChange }: SelectionTableProps) {
  const [items] = useState<Item[]>(generateItems)
  const [selectedItems, setSelectedItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<ItemType[]>(["ILD", "Scenario"])

  const selectedILDCount = selectedItems.filter((item) => item.type === "ILD").length
  const selectedScenarioCount = selectedItems.filter((item) => item.type === "Scenario").length

  const maxILD = 9
  const maxScenario = 37

  // Filter items based on search query and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status)
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(item.category)
    const matchesType = typeFilter.length === 0 || typeFilter.includes(item.type)

    return matchesSearch && matchesStatus && matchesCategory && matchesType
  })

  // Handle item selection
  const toggleItemSelection = (item: Item) => {
    if (isSelected(item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
    } else {
      // Check if we've reached the limit for this type
      if (item.type === "ILD" && selectedILDCount >= maxILD) {
        alert(`You can only select up to ${maxILD} ILD items`)
        return
      }
      if (item.type === "Scenario" && selectedScenarioCount >= maxScenario) {
        alert(`You can only select up to ${maxScenario} Scenario items`)
        return
      }

      setSelectedItems([...selectedItems, item])
    }
  }

  // Check if an item is selected
  const isSelected = (id: number) => {
    return selectedItems.some((item) => item.id === id)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter([])
    setCategoryFilter([])
    setTypeFilter(["ILD", "Scenario"])
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedItems([])
  }

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedItems)
    }
  }, [selectedItems, onSelectionChange])

  // Get all unique categories
  const categories = Array.from(new Set(items.map((item) => item.category)))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="p-2">
                <p className="text-xs font-medium mb-2">Type</p>
                <div className="space-y-1">
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes("ILD")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTypeFilter([...typeFilter, "ILD"])
                      } else {
                        setTypeFilter(typeFilter.filter((t) => t !== "ILD"))
                      }
                    }}
                  >
                    ILD
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes("Scenario")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTypeFilter([...typeFilter, "Scenario"])
                      } else {
                        setTypeFilter(typeFilter.filter((t) => t !== "Scenario"))
                      }
                    }}
                  >
                    Scenario
                  </DropdownMenuCheckboxItem>
                </div>
              </div>

              <div className="p-2 border-t">
                <p className="text-xs font-medium mb-2">Status</p>
                <div className="space-y-1">
                  {["active", "pending", "archived"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, status])
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== status))
                        }
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>

              <div className="p-2 border-t">
                <p className="text-xs font-medium mb-2">Category</p>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={categoryFilter.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCategoryFilter([...categoryFilter, category])
                        } else {
                          setCategoryFilter(categoryFilter.filter((c) => c !== category))
                        }
                      }}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchQuery || statusFilter.length > 0 || categoryFilter.length > 0 || typeFilter.length !== 2) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <LineChart className="h-3 w-3" />
            ILD: {selectedILDCount}/{maxILD}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <PieChart className="h-3 w-3" />
            Scenarios: {selectedScenarioCount}/{maxScenario}
          </Badge>
          {selectedItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelections} className="h-9">
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isItemSelected = isSelected(item.id)
                const isDisabled =
                  !isItemSelected &&
                  ((item.type === "ILD" && selectedILDCount >= maxILD) ||
                    (item.type === "Scenario" && selectedScenarioCount >= maxScenario))

                return (
                  <TableRow
                    key={item.id}
                    className={cn(isItemSelected && "bg-gray-50 dark:bg-gray-900", isDisabled && "opacity-50")}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isItemSelected}
                        onCheckedChange={() => toggleItemSelection(item)}
                        disabled={isDisabled}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.type === "ILD" ? (
                          <LineChart className="h-4 w-4 text-blue-500" />
                        ) : (
                          <PieChart className="h-4 w-4 text-purple-500" />
                        )}
                        {item.type}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          item.status === "active" && "border-green-500 text-green-500",
                          item.status === "pending" && "border-yellow-500 text-yellow-500",
                          item.status === "archived" && "border-gray-500 text-gray-500",
                        )}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
