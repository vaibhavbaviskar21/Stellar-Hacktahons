import { type NextRequest, NextResponse } from "next/server"

// Mock database for interviews
const interviews: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get("candidateId")
  const recruiterId = searchParams.get("recruiterId")

  // Filter interviews based on query parameters
  let filtered = interviews

  if (candidateId) {
    filtered = filtered.filter((i) => i.candidateId === candidateId)
  }

  if (recruiterId) {
    filtered = filtered.filter((i) => i.recruiterId === recruiterId)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newInterview = {
    id: `int_${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    status: "proposed",
  }

  interviews.push(newInterview)
  return NextResponse.json(newInterview, { status: 201 })
}
