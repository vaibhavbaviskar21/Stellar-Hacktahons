import { type NextRequest, NextResponse } from "next/server"

// Mock database for feedback
const feedbackList: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get("candidateId")
  const interviewId = searchParams.get("interviewId")

  // Filter feedback based on query parameters
  let filtered = feedbackList

  if (candidateId) {
    filtered = filtered.filter((f) => f.candidateId === candidateId)
  }

  if (interviewId) {
    filtered = filtered.filter((f) => f.interviewId === interviewId)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newFeedback = {
    id: `fb_${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
  }

  feedbackList.push(newFeedback)
  return NextResponse.json(newFeedback, { status: 201 })
}
