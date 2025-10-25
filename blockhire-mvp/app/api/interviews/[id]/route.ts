import { type NextRequest, NextResponse } from "next/server"

// Mock database
const interviews: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const interview = interviews.find((i) => i.id === params.id)

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  return NextResponse.json(interview)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const index = interviews.findIndex((i) => i.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  interviews[index] = {
    ...interviews[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(interviews[index])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const index = interviews.findIndex((i) => i.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  const deleted = interviews.splice(index, 1)
  return NextResponse.json(deleted[0])
}
