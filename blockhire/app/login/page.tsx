"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useWallet } from "@/contexts/WalletContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") as "candidate" | "recruiter" | null
  const { isConnected, publicKey, connecting, connect, error: walletError } = useWallet()

  const [role, setRole] = useState<"candidate" | "recruiter">(roleParam || "candidate")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if wallet is connected
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    setLoading(true)

    // Store user session with wallet address
    localStorage.setItem("userRole", role)
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userId", `user_${Math.random().toString(36).substr(2, 9)}`)

    // Redirect based on role
    setTimeout(() => {
      if (role === "candidate") {
        router.push("/dashboard/candidate")
      } else {
        router.push("/dashboard/recruiter")
      }
      setLoading(false)
    }, 300)
  }

  const handleConnectWallet = async () => {
    try {
      await connect()
    } catch (e) {
      console.error("Failed to connect wallet:", e)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">⛓</span>
            </div>
            <span className="text-2xl font-bold text-foreground">BlockHire</span>
          </div>
          <p className="text-muted-foreground">Decentralized Recruitment Platform</p>
        </div>

        {/* Wallet Connection Section */}
        <div className="mb-6">
          {!isConnected ? (
            <Card className="border-border bg-secondary/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Connect your Stellar wallet to continue</p>
                  <Button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </Button>
                  {walletError && <p className="text-sm text-red-500">{walletError}</p>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-primary">✓ Wallet Connected</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {publicKey?.substring(0, 8)}...{publicKey?.substring(publicKey.length - 8)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your BlockHire account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("candidate")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      role === "candidate"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      role === "recruiter"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email || !isConnected}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              {!isConnected && (
                <p className="text-center text-sm text-amber-600">Please connect your wallet first</p>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          <Link href="/" className="text-primary hover:text-primary/80">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
