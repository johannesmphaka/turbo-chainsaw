import type { Metadata } from "next"
import DashboardPageClient from "./DashboardPageClient"

export const metadata: Metadata = {
  title: "Dashboard - Analytics Dashboard",
  description: "Main dashboard for analytics",
}

export default function DashboardPage() {
  return <DashboardPageClient />
}
