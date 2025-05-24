import type { Metadata } from "next"
import RunHistoryClient from "./RunHistoryClient"

export const metadata: Metadata = {
  title: "Run History - Analytics Dashboard",
  description: "View and manage capital run history",
}

export default function RunHistoryPage() {
  return <RunHistoryClient />
}
