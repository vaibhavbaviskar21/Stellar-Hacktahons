"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, CheckCircle2, MessageSquare } from "lucide-react"
import { mockRecruiterData } from "@/lib/mock-data"

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(mockRecruiterData.interviews)
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "accepted":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "completed":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Interviews</h1>
        <p className="text-neutral-400 mt-1">Manage your interview schedule</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{interviews.length}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {interviews.filter((i) => i.status === "completed").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {interviews.filter((i) => i.status !== "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews List */}
      <div className="space-y-3">
        {interviews.map((interview) => (
          <Card
            key={interview.id}
            className="border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800/70 transition-all cursor-pointer"
            onClick={() => setSelectedInterview(selectedInterview === interview.id ? null : interview.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {interview.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{interview.candidateName}</h3>
                    <p className="text-sm text-neutral-400">{interview.position}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(interview.status)}>
                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">{interview.date}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">{interview.time}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm">{interview.type}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedInterview === interview.id && (
                <div className="border-t border-neutral-700 pt-4 mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-300 mb-2">Meeting Link</p>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm">
                      {interview.meetingLink}
                    </a>
                  </div>

                  {interview.status === "completed" && (
                    <div className="bg-neutral-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <p className="text-sm font-medium text-neutral-300">Interview Completed</p>
                      </div>
                      <p className="text-sm text-neutral-300 mb-3">Feedback submitted and candidate notified</p>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Feedback
                      </Button>
                    </div>
                  )}

                  {interview.status !== "completed" && (
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-neutral-600 text-white hover:bg-neutral-800 bg-transparent"
                      >
                        Reschedule
                      </Button>
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
