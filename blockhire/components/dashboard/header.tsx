"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"

export function Header() {
  const [userEmail, setUserEmail] = useState("")
  const { isConnected, publicKey, disconnect } = useWallet()
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    setUserEmail(email || "")
  }, [])

  const handleDisconnect = () => {
    disconnect()
    localStorage.clear()
    router.push("/login")
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Wallet Status */}
        {isConnected && publicKey && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-green-700 dark:text-green-400">
              {publicKey.substring(0, 4)}...{publicKey.substring(publicKey.length - 4)}
            </span>
          </div>
        )}

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">{userEmail.split("@")[0]}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-foreground"
          title="Disconnect & Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
