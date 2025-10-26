import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import WalletButton from '../components/WalletButton'

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BlockHire - Decentralized Recruitment",
  description: "Transparent, trustless hiring powered by blockchain",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <div style={{ position: 'fixed', right: 16, top: 12, zIndex: 60 }}>
          <WalletButton />
        </div>
        {children}
      </body>
    </html>
  )
}
