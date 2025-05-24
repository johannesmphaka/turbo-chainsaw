import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface PlotCardProps {
  id: number
  title: string
  description?: string
  className?: string
  linkTo?: string
  imageUrl?: string
}

export function PlotCard({ id, title, description, className, linkTo, imageUrl }: PlotCardProps) {
  const content = (
    <Card className={cn("h-full transition-all hover:shadow-md", className)}>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-sm">Plot {id}</div>
          )}
        </div>
        {description && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      </CardContent>
      {linkTo && (
        <CardFooter className="p-4 pt-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            View details <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardFooter>
      )}
    </Card>
  )

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }

  return content
}
