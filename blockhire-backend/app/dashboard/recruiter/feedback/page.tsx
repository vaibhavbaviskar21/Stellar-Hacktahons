"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { mockRecruiterData } from "@/lib/mock-data"

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState(mockRecruiterData.feedback)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState("")

  const handleSubmitFeedback = () => {
    if (selectedCandidate && rating > 0) {
      setFeedbackList([
        ...feedbackList,
        {
          id: `feedback_${Date.now()}`,
          candidateName: selectedCandidate,
          rating,
          comments,
          date: new Date().toLocaleDateString(),
        },
      ])
      setSelectedCandidate(null)
      setRating(0)
      setComments("")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Interview Feedback</h1>
        <p className="text-neutral-400 mt-1">Submit and view interview feedback</p>
      </div>

      {/* Submit Feedback Form */}
      <Card className="border-indigo-500 bg-indigo-500/10">
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>Rate and comment on candidate interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">Candidate</label>
            <input
              type="text"
              placeholder="Enter candidate name"
              value={selectedCandidate || ""}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder:text-neutral-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-all ${star <= rating ? "text-yellow-400" : "text-neutral-600"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 mb-2 block">Comments</label>
            <Textarea
              placeholder="Share your feedback about the candidate..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="bg-neutral-700/50 border-neutral-600 text-white placeholder:text-neutral-500"
              rows={4}
            />
          </div>

          <Button
            onClick={handleSubmitFeedback}
            disabled={!selectedCandidate || rating === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Feedback History</h2>
        <div className="space-y-3">
          {feedbackList.map((feedback) => (
            <Card key={feedback.id} className="border-neutral-700 bg-neutral-800/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{feedback.candidateName}</h3>
                    <p className="text-sm text-neutral-400">{feedback.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < feedback.rating ? "text-yellow-400 text-lg" : "text-neutral-600 text-lg"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-300">{feedback.comments}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
