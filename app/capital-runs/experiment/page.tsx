import type { Metadata } from "next"
import ExperimentRunsClient from "./ExperimentRunsClient"

export const metadata: Metadata = {
  title: "Experiment Runs - Analytics Dashboard",
  description: "Create and manage experiment capital runs",
}

export default function ExperimentRunsPage() {
  return <ExperimentRunsClient />
}
