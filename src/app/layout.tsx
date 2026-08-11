import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Crypto APIs — Open Directory",
  description: "Verified cryptocurrency APIs for people, developers, and AI agents.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Crypto APIs",
    description: "An open directory of cryptocurrency APIs.",
    type: "website",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
