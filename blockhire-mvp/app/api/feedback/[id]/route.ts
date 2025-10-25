import { type NextRequest, NextResponse } from "next/server"

// Mock database
const feedbackList: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const feedback = feedbackList.find((f) => f.id === params.id)

  if (!feedback) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  return NextResponse.json(feedback)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const index = feedbackList.findIndex((f) => f.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  feedbackList[index] = {
    ...feedbackList[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(feedbackList[index])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const index = feedbackList.findIndex((f) => f.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
  }

  const deleted = feedbackList.splice(index, 1)
  return NextResponse.json(deleted[0])
}
