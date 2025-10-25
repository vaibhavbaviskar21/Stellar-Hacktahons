"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Award, Star } from "lucide-react"

export default function ReputationPage() {
  const reputationData = [
    { month: "Jan", score: 3.5 },
    { month: "Feb", score: 3.8 },
    { month: "Mar", score: 4.1 },
    { month: "Apr", score: 4.3 },
    { month: "May", score: 4.6 },
    { month: "Jun", score: 4.8 },
  ]

  const feedbackData = [
    { company: "Google", rating: 5, comment: "Excellent technical skills" },
    { company: "Microsoft", rating: 4, comment: "Great communication" },
    { company: "Amazon", rating: 5, comment: "Very professional" },
    { company: "Meta", rating: 4, comment: "Good problem solving" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reputation</h1>
        <p className="text-muted-foreground mt-1">Your blockchain-verified professional reputation</p>
      </div>

      {/* Reputation Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">4.8</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < 5 ? "text-accent" : "text-border"}>
                  ★
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Interviews Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">Total interviews</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent">+0.3</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Reputation Trend Chart */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Reputation Trend</CardTitle>
          <CardDescription>Your reputation score over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reputationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" domain={[0, 5]} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Feedback from your interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbackData.map((feedback, i) => (
              <div key={i} className="flex items-start justify-between pb-4 border-b border-border last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{feedback.company}</h4>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className={j < feedback.rating ? "text-accent text-sm" : "text-border text-sm"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
