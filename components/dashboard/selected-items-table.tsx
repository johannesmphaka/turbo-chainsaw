"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, PieChart, X } from "lucide-react"
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

interface SelectedItemsTableProps {
  items: Item[]
  onRemoveItem?: (id: number) => void
}

export function SelectedItemsTable({ items, onRemoveItem }: SelectedItemsTableProps) {
  const ildItems = items.filter((item) => item.type === "ILD")
  const scenarioItems = items.filter((item) => item.type === "Scenario")

  if (items.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">No items selected. Please select items from the table above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ildItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-500" />
            Selected ILD Items ({ildItems.length})
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ildItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
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
                    <TableCell>
                      {onRemoveItem && (
                        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {scenarioItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            Selected Scenario Items ({scenarioItems.length})
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarioItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
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
                    <TableCell>
                      {onRemoveItem && (
                        <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
