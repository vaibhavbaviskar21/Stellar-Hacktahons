"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle2, Lock, Zap, Users, FileCheck, TrendingUp } from "lucide-react"

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter" | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">⛓</span>
            </div>
            <span className="text-xl font-bold text-foreground">BlockHire</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Decentralized Recruitment Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transparent Hiring,
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Powered by Blockchain
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            BlockHire gives candidates control over their credentials and provides recruiters with verified,
            tamper-proof access to talent. No intermediaries. No fraud. Pure transparency.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <Card
            className="border-border hover:border-primary/50 cursor-pointer transition-all"
            onClick={() => setSelectedRole("candidate")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                For Candidates
              </CardTitle>
              <CardDescription>Own your professional data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Sovereign data ownership</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Portable reputation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Verified credentials</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border hover:border-primary/50 cursor-pointer transition-all"
            onClick={() => setSelectedRole("recruiter")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                For Recruiters
              </CardTitle>
              <CardDescription>Access verified talent pools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Verified candidates</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Automated workflows</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Transparent feedback</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login?role=candidate">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started as Candidate
            </Button>
          </Link>
          <Link href="/login?role=recruiter">
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Get Started as Recruiter
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why BlockHire?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border">
            <CardHeader>
              <Lock className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Secure & Transparent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All interactions are immutable and auditable on the blockchain. No hidden processes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <FileCheck className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Verified Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cryptographic proof of skills and experience. Resume fraud becomes impossible.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Portable Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your professional reputation travels with you across platforms and opportunities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
