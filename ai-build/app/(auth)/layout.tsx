import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - Study Mitra",
  description: "Authentication pages for Study Mitra",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen flex items-center justify-center bg-muted/30">{children}</div>
}

