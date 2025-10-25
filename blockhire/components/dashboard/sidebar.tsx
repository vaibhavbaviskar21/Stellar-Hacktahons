"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Calendar, Users, BarChart3, LogOut, Settings, Lock } from "lucide-react"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<"candidate" | "recruiter" | "admin" | null>(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole") as "candidate" | "recruiter" | null
    setUserRole(role)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    router.push("/")
  }

  const candidateLinks = [
    { href: "/dashboard/candidate", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/candidate/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/candidate/interviews", label: "Interviews", icon: Calendar },
    { href: "/dashboard/candidate/reputation", label: "Reputation", icon: BarChart3 },
    { href: "/dashboard/candidate/access", label: "Access Requests", icon: Lock },
  ]

  const recruiterLinks = [
    { href: "/dashboard/recruiter", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/recruiter/search", label: "Find Candidates", icon: Users },
    { href: "/dashboard/recruiter/interviews", label: "Interviews", icon: Calendar },
    { href: "/dashboard/recruiter/feedback", label: "Feedback", icon: FileText },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  const links = userRole === "candidate" ? candidateLinks : userRole === "recruiter" ? recruiterLinks : adminLinks

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">⛓</span>
          </div>
          <span className="text-lg font-bold text-foreground">BlockHire</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/dashboard/settings">
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  )
}
