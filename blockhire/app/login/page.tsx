"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import WalletButton with no SSR to prevent hydration issues
const WalletButton = dynamic(() => import('@/components/WalletButton'), {
  ssr: false,
  loading: () => <div className="h-10 w-40 animate-pulse bg-gray-200 rounded" />
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") as "candidate" | "recruiter" | null

  const [role, setRole] = useState<"candidate" | "recruiter">(roleParam || "candidate")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login
    setTimeout(() => {
      // Store user session
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)
      localStorage.setItem("userId", `user_${Math.random().toString(36).substr(2, 9)}`)

      // Redirect based on role
      if (role === "candidate") {
        router.push("/dashboard/candidate")
      } else {
        router.push("/dashboard/recruiter")
      }
      setLoading(false)
    }, 500)
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

        <div className="mb-6 flex items-center justify-center">
          <WalletButton />
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
                disabled={loading || !email}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Signing in..." : "Sign In with Stellar Wallet"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">Demo: Use any email to login</p>
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
