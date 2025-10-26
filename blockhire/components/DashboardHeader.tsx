"use client"

import { useWallet } from "@/contexts/WalletContext"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export default function DashboardHeader() {
  const { isConnected, publicKey, disconnect } = useWallet()
  const router = useRouter()

  const handleDisconnect = () => {
    disconnect()
    router.push("/login")
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">⛓</span>
          </div>
          <h1 className="text-lg font-semibold">BlockHire</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              {publicKey?.substring(0, 6)}...{publicKey?.substring(publicKey.length - 4)}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-xs"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}
