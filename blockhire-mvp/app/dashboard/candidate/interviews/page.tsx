"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, MessageSquare } from "lucide-react"
import { mockCandidateData } from "@/lib/mock-data"

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(mockCandidateData.interviews)
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null)

  const handleAccept = (id: string) => {
    setInterviews(interviews.map((i) => (i.id === id ? { ...i, status: "accepted" as const } : i)))
  }

  const handleReject = (id: string) => {
    setInterviews(interviews.map((i) => (i.id === id ? { ...i, status: "rejected" as const } : i)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-primary/20 text-primary border-primary/30"
      case "accepted":
        return "bg-accent/20 text-accent border-accent/30"
      case "rejected":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "completed":
        return "bg-primary/20 text-primary border-primary/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Interviews</h1>
        <p className="text-muted-foreground mt-1">Manage your interview schedule and feedback</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["all", "proposed", "accepted", "completed"].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 text-sm font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-border capitalize"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.map((interview) => (
          <Card
            key={interview.id}
            className="border-border bg-card/50 hover:bg-card/70 transition-all cursor-pointer"
            onClick={() => setSelectedInterview(selectedInterview === interview.id ? null : interview.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{interview.company}</h3>
                  <p className="text-sm text-muted-foreground">{interview.position}</p>
                </div>
                <Badge className={getStatusColor(interview.status)}>
                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">{interview.time}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{interview.type}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedInterview === interview.id && (
                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Interviewer</p>
                    <p className="text-foreground">{interview.interviewer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Meeting Link</p>
                    <a href="#" className="text-primary hover:text-primary/80 text-sm">
                      {interview.meetingLink}
                    </a>
                  </div>

                  {interview.status === "proposed" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAccept(interview.id)}
                        className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleReject(interview.id)}
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {interview.status === "completed" && interview.feedback && (
                    <div className="bg-secondary rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                      </div>
                      <p className="text-sm text-foreground">{interview.feedback}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <span className="text-sm font-semibold text-accent">⭐ {interview.rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
