import { type NextRequest, NextResponse } from "next/server"

// Mock database for access requests
const accessRequests: any[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const candidateId = searchParams.get("candidateId")
  const status = searchParams.get("status")

  let filtered = accessRequests

  if (candidateId) {
    filtered = filtered.filter((r) => r.candidateId === candidateId)
  }

  if (status) {
    filtered = filtered.filter((r) => r.status === status)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newRequest = {
    id: `access_${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
    status: "pending",
  }

  accessRequests.push(newRequest)
  return NextResponse.json(newRequest, { status: 201 })
}
