"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useWallet } from "@/contexts/WalletContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected } = useWallet()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    
    // Check both user role and wallet connection
    if (!userRole) {
      router.push("/login")
      return
    }
    
    // If user session exists but wallet disconnected, redirect to login
    if (!isConnected) {
      const walletKey = localStorage.getItem('walletPublicKey')
      if (!walletKey) {
        router.push("/login")
        return
      }
    }
    
    setIsLoading(false)
  }, [router, isConnected])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
