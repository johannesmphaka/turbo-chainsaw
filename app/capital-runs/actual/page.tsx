import type { Metadata } from "next"
import ActualRunsClient from "./ActualRunsClient"

export const metadata: Metadata = {
  title: "Actual Runs - Analytics Dashboard",
  description: "Create and manage actual capital runs",
}

export default function ActualRunsPage() {
  return <ActualRunsClient />
}
