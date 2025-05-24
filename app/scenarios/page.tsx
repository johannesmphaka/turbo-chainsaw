import type { Metadata } from "next"
import ScenariosPageClient from "./ScenariosPageClient"

export const metadata: Metadata = {
  title: "Scenarios - Analytics Dashboard",
  description: "Scenario analysis and charts",
}

export default function ScenariosPage() {
  return <ScenariosPageClient />
}
