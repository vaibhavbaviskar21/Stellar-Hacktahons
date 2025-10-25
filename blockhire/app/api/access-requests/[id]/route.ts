import { type NextRequest, NextResponse } from "next/server"

// Mock database
const accessRequests: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const accessRequest = accessRequests.find((r) => r.id === params.id)

  if (!accessRequest) {
    return NextResponse.json({ error: "Access request not found" }, { status: 404 })
  }

  return NextResponse.json(accessRequest)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const index = accessRequests.findIndex((r) => r.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Access request not found" }, { status: 404 })
  }

  const validStatuses = ["pending", "granted", "denied", "expired"]
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  accessRequests[index] = {
    ...accessRequests[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(accessRequests[index])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const index = accessRequests.findIndex((r) => r.id === params.id)

  if (index === -1) {
    return NextResponse.json({ error: "Access request not found" }, { status: 404 })
  }

  const deleted = accessRequests.splice(index, 1)
  return NextResponse.json(deleted[0])
}
