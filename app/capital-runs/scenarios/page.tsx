import type { Metadata } from "next"
import ScenarioRunsClient from "./ScenarioRunsClient"

export const metadata: Metadata = {
  title: "Scenario Runs - Analytics Dashboard",
  description: "Run and monitor captured scenarios",
}

export default function ScenarioRunsPage() {
  return <ScenarioRunsClient />
}
