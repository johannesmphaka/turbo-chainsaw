import type { Metadata } from "next"
import ILDDetailPageClient from "./ILDDetailPageClient"

interface ILDDetailPageProps {
  params: {
    id: string
  }
}

export function generateMetadata({ params }: ILDDetailPageProps): Metadata {
  return {
    title: `ILD Plot ${params.id} - Analytics Dashboard`,
    description: `Detailed analysis for ILD Plot ${params.id}`,
  }
}

export default function ILDDetailPage({ params }: ILDDetailPageProps) {
  return <ILDDetailPageClient params={params} />
}
