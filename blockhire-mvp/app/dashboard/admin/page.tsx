"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, Calendar } from "lucide-react"

export default function AdminDashboard() {
  const platformStats = {
    totalUsers: 1250,
    totalCandidates: 850,
    totalRecruiters: 350,
    totalInterviews: 2340,
    totalDocuments: 5680,
    averageReputation: 4.2,
  }

  const userGrowth = [
    { month: "Jan", candidates: 120, recruiters: 45 },
    { month: "Feb", candidates: 180, recruiters: 65 },
    { month: "Mar", candidates: 250, recruiters: 95 },
    { month: "Apr", candidates: 380, recruiters: 140 },
    { month: "May", candidates: 550, recruiters: 210 },
    { month: "Jun", candidates: 850, recruiters: 350 },
  ]

  const interviewStats = [
    { name: "Completed", value: 1850, color: "#10b981" },
    { name: "Scheduled", value: 340, color: "#3b82f6" },
    { name: "Proposed", value: 150, color: "#f59e0b" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-neutral-400 mt-1">Platform analytics and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{platformStats.totalUsers}</div>
            <p className="text-xs text-neutral-500 mt-1">
              {platformStats.totalCandidates} candidates, {platformStats.totalRecruiters} recruiters
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{platformStats.totalInterviews}</div>
            <p className="text-xs text-neutral-500 mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents Uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{platformStats.totalDocuments}</div>
            <p className="text-xs text-neutral-500 mt-1">Verified on blockchain</p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="border-neutral-700 bg-neutral-800/50">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Candidate and recruiter growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="candidates" fill="#6366f1" name="Candidates" />
              <Bar dataKey="recruiters" fill="#10b981" name="Recruiters" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Interview Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader>
            <CardTitle>Interview Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={interviewStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interviewStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                  labelStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-neutral-700 bg-neutral-800/50">
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">API Uptime</span>
                <span className="text-sm font-bold text-green-400">99.9%</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "99.9%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">Average Response Time</span>
                <span className="text-sm font-bold text-green-400">145ms</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">Database Health</span>
                <span className="text-sm font-bold text-green-400">Optimal</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
