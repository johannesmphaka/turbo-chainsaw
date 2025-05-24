import type { Metadata } from "next"
import ILDPageClient from "./ILDPageClient"

export const metadata: Metadata = {
  title: "ILD - Analytics Dashboard",
  description: "ILD plots and analysis",
}

export default function ILDPage() {
  return <ILDPageClient />
}
