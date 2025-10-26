"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Eye } from "lucide-react"
import { mockCandidateData } from "@/lib/mock-data"

export default function AccessPage() {
  const [accessRequests, setAccessRequests] = useState(mockCandidateData.accessRequests)

  const handleApprove = (id: string) => {
    setAccessRequests(accessRequests.map((req) => (req.id === id ? { ...req, status: "granted" as const } : req)))
  }

  const handleDeny = (id: string) => {
    setAccessRequests(accessRequests.map((req) => (req.id === id ? { ...req, status: "denied" as const } : req)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-primary/20 text-primary border-primary/30"
      case "granted":
        return "bg-accent/20 text-accent border-accent/30"
      case "denied":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "expired":
        return "bg-muted/20 text-muted-foreground border-muted/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Access Requests</h1>
        <p className="text-muted-foreground mt-1">Control who can view your documents and profile</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{accessRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {accessRequests.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Granted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {accessRequests.filter((r) => r.status === "granted").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {accessRequests.filter((r) => r.status === "denied").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Requests List */}
      <div className="space-y-3">
        {accessRequests.map((request) => (
          <Card key={request.id} className="border-border bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{request.recruiterName}</h3>
                      <p className="text-sm text-muted-foreground">{request.recruiterCompany}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Requested:</span> {request.requestedDate}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Documents:</span> {request.documents.join(", ")}
                    </p>
                    {request.expiryDate && (
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Expires:</span> {request.expiryDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeny(request.id)}
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
